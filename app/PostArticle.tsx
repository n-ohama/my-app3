"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

export default function PostArticle({post, user_id}: {post: any, user_id: string}) {
  const router = useRouter();
  const [commentDraft, setCommentDraft] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const comments = Array.isArray(post.comment_agg)
    ? post.comment_agg.filter((comment: any) => comment?.content)
    : [];

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
        <button
          type="button"
          className="transition hover:text-slate-200"
          onClick={() => setIsCommentOpen((current) => !current)}
        >
          💬 {post.stats?.comments}
        </button>
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
      {isCommentOpen && (
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          {comments.length > 0 && (
            <ul className="mb-3 space-y-2">
              {comments.map((comment: any, index: number) => (
                <li key={`${comment.comment_user_name ?? "user"}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-sm text-slate-300">
                  <p className="text-slate-400">{comment.comment_user_name ?? "ユーザー"}</p>
                  <p>{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
          <textarea
            className="w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            rows={2}
            placeholder="コメントを入力..."
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-400"
              onClick={async () => {
                const content = commentDraft.trim();
                if (!content) return;

                await supabase.from("comments").insert({
                  content,
                  post_id: post.id,
                  user_id,
                });

                setCommentDraft("");
                router.refresh();
              }}
            >
              コメントする
            </button>
          </div>
        </div>
      )}
    </article>
  );
}