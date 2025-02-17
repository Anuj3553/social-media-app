"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// The Bookmarks component
export default function Bookmarks() {
    const {
        data, // The resolved data
        fetchNextPage, // The function to fetch the next page
        hasNextPage, // Whether or not there is another page available
        isFetching, // Whether or not the query is currently fetching
        isFetchingNextPage, // Whether or not the next page is currently being fetched
        status, // The status of the query
    } = useInfiniteQuery({ // The hook to use infinite queries
        queryKey: ["post-feed", "bookmarks"], // The key for the query
        queryFn: ({ pageParam }) => // The function to fetch the data
            kyInstance // The ky instance
                .get(
                    "/api/posts/bookmarked", // The endpoint
                    pageParam ? { searchParams: { cursor: pageParam } } : {}, // The search params for the query
                )
                .json<PostsPage>(), // The type of the response
        initialPageParam: null as string | null, // The initial page param
        getNextPageParam: (lastPage) => lastPage.nextCursor, // The function to get the next page param
    });

    // The posts from the data
    const posts = data?.pages.flatMap((page) => page.posts) || [];

    // The JSX to render while loading bookmarks
    if (status === "pending") {
        return <PostsLoadingSkeleton />;
    }

    // The JSX to render if there are no bookmarks
    if (status === "success" && !posts.length && !hasNextPage) {
        return (
            <p className="text-center text-muted-foreground">
                You don&apos;t have any bookmark yet.
            </p>
        );
    }

    // The JSX to render if an error occurred while loading bookmarks
    if (status === "error") {
        return (
            <p className="text-center text-destructive">
                An error occurred while loading bookmarks.
            </p>
        );
    }

    return (
        <InfiniteScrollContainer
            className="space-y-5"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
            {posts.map((post) => (
                <Post key={post.id} post={post} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
        </InfiniteScrollContainer>
    );
}