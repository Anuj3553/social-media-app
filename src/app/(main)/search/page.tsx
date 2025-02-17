import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResults from "./SearchResults";

// Page properties
interface PageProps {
    searchParams: Promise<{ q: string }>;
}

// Generate the page metadata
export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const searchParams = await props.searchParams;

    const {
        q
    } = searchParams;

    return {
        title: `Search results for "${q}"`, // Set the page title
    };
}

// Get the search query from the query string
export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;

    const {
        q
    } = searchParams;

    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <div className="rounded-2xl bg-card p-5 shadow-sm">
                    <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
                        Search results for &quot;{q}&quot;
                    </h1>
                </div>
                <SearchResults query={q} />
            </div>
            <TrendsSidebar />
        </main>
    );
}