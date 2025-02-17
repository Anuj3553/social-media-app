import { validateRequest } from "@/auth";
import FollowerCount from "@/components/FollowerCount";
import TrendsSidebar from "@/components/TrendsSidebar";
import FollowButton from "@/components/ui/FollowButton";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { notFound } from "next/navigation";
import { cache } from "react";
import UserPosts from "./UserPosts";
import { Metadata } from "next";
import Linkify from "@/components/ui/Linkify";
import EditProfileButton from "./EditProfileButton";

interface PageProps {
    params: Promise<{ username: string; }>
}

//  This function fetches the user data from the database
const getUser = cache(async (username: string, loggedInUserId: string) => {
    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: "insensitive",
            },
        },
        select: getUserDataSelect(loggedInUserId),
    });

    if (!user) notFound();

    return user;
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;

    const {
        username
    } = params;

    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return {};

    const user = await getUser(username, loggedInUser.id);

    return {
        title: `${user.displayName} (@${user.username})`,
    };
}

export default async function Page(props: PageProps) {
    const params = await props.params;

    const {
        username
    } = params;

    // Validate the request    
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
        return (
            <p className="text-destructive">
                You&apos;re not authorized to view this page.
            </p>
        );
    }

    const user = await getUser(username, loggedInUser.id);

    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <UserProfile user={user} loggedinUserId={loggedInUser.id} />
                <div className="rounded-2xl bg-card p-5 shadow-sm">
                    <h2 className="text-center text-2xl font-bold">
                        {user.displayName} Posts
                    </h2>
                </div>
                <UserPosts userId={user.id} />
            </div>
            {/* Trends sidebar */}
            <TrendsSidebar />
        </main>
    );
}

interface UserProfileProps {
    user: UserData;
    loggedinUserId: string;
}

async function UserProfile({ user, loggedinUserId }: UserProfileProps) {
    const followerInfo: FollowerInfo = {
        followers: user._count.followers,
        isFollowedByUser: user.followers.some(
            ({ followerId }) => followerId === loggedinUserId
        )
    };

    return (
        <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
            <UserAvatar
                avatarUrl={user.avatarUrl}
                size={1000}
                className="mx-auto size-full max-h-60 max-w-60 rounded-full"
            />
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
                <div className="me-auto space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <div className="text-muted-foreground">@{user.username}</div>
                    </div>
                    <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
                    <div className="flex items-center gap-3">
                        <span>
                            Posts: {" "}
                            <span className="font-semibold">
                                {formatNumber(user._count.posts)}
                            </span>
                        </span>
                        <FollowerCount userId={user.id} initialState={followerInfo} />
                    </div>
                </div>
                {user.id === loggedinUserId ? (
                    <EditProfileButton user={user} />
                ) : (
                    <FollowButton userId={user.id} initialState={followerInfo} />
                )}
            </div>
            {user.bio &&
                <>
                    <hr />
                    <Linkify>
                        <div className="whitespace-pre-line overflow-hidden break-words">
                            {user.bio}
                        </div>
                    </Linkify>
                </>
            }
        </div>
    );
}
