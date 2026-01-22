


import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { PostPresence } from "@/components/web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeftIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PostIdRouteProps {
    params: Promise<{
        postId: Id<"posts">
    }>
}

export async function generateMetadata({ params }: PostIdRouteProps):
    Promise<Metadata> {
    const { postId } = await params

    const post = await fetchQuery(api.posts.getPostById, { postId: postId })

    if (!post) {
        return {
            title: 'No post found'
        }
    }

    return {
        title: post.title,
        description: post.body,
    }

}

export default async function PostIdRoute({
    params
}: PostIdRouteProps) {
    const { postId } = await params

    const token = await getToken()

    const [post, preloadedComments, userId] = await Promise.all([
        await fetchQuery(api.posts.getPostById, { postId: postId }),
        await preloadQuery(api.comments.getCommentsByPostId, { postId: postId }),
        await fetchQuery(api.presence.getUserId, {}, { token })
    ])


    if (!post) {
        return (
            <div>
                <h1 className="text-6xl font-extrabold text-red-500">No Posts Found</h1>
            </div>
        )
    }

    if (!userId) {
        return redirect('/auth/login')
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
            <Link href="/blog" className={buttonVariants({ variant: 'outline', className: "mb-4" })}>
                <ArrowLeftIcon className="size-4" />
                Back to blog
            </Link>

            <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
                <Image
                    src={post.imageUrl ?? "https://images.unsplash.com/photo-1761168129112-4ddc297dc797?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBsYWNlaG9sZGVyJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D"}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="space-y-4 flex flex-col">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{post.title}</h1>
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground text-sm">Posted on: {new Date(post._creationTime).toLocaleDateString("en-US")}</p>
                    {userId && <PostPresence roomId={post._id} userId={userId} />}
                </div>

            </div>
            <Separator className="my-8" />
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.body}</p>

            <Separator className="my-8" />

            <CommentSection preloadedComments={preloadedComments} />

        </div>
    )
}
