"use client";

// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export default function PostArticle({post, user_id}: {post: any, user_id: string}) {
  const router = useRouter();
  return (
    <article key={post.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-200">
          {post.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{post.name}</h2>
            <span className="text-sm text-slate-400">{post.handle}</span>
            <span className="text-sm text-slate-500">• {post.time}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{post.content}</p>
        </div>
      </div>
      <div className="flex gap-6 text-sm text-slate-400">
        <span>💬 {post.stats?.comments}</span>
        {/* <span>🔁 {post.stats?.reposts}</span> */}
        <button
          type="button"
          className="transition hover:text-slate-200"
          onClick={async () => {
            const isLiked = post.likes_uid.some((like: any) => like.user_id === user_id);
            
            if (isLiked) {
              await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user_id);
            } else {
              await supabase.from("likes").insert({ post_id: post.id, user_id: user_id });
            }

            router.refresh();
          }}
        >
          ❤️ {post.likes_count}
        </button>
      </div>
    </article>
  );
}