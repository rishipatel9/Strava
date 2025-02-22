import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASEURL } from "@/utils/constants";
import { useSession } from "next-auth/react";

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full" width="32" height="32" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{body}</blockquote>
        </figure>
    );
};

export function MarqueeDemo() {
    const { data: session } = useSession();

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["incidents"],
        queryFn: async () => {
            if (!session) return [];  // Ensure session exists
            const response = await axios.get(`${BASEURL}/incident/getAll`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,  // Ensure the correct token is used
                },
            });
            console.log("API Response:", response.data); // Debugging
            return response.data;
        },
        enabled: !!session,
    });

    const incidents = response?.incidents || []; // Ensure the correct data structure is used

    if (isLoading) return <p>Loading incidents...</p>;
    if (isError || !incidents.length) return <p>Failed to load incidents.</p>;

    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
                {incidents.map((incident: any) => (
                    <ReviewCard
                        key={incident.id}
                        img={incident.imageUrl || "https://avatar.vercel.sh/default"}
                        name={incident.title || "Unknown"}
                        username={`@${incident.userId?.slice(-5) || "anonymous"}`} // Last 5 chars as a fallback username
                        body={incident.description || "No description available"}
                    />
                ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
    );
}
