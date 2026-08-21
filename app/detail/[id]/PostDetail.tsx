"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/supabase";
import { useRouter } from "next/navigation";

export default function PostDetail({postId, user_id, posts}: {postId: number; user_id: string, posts: any[]}) {
  const [inputComment, setInputComment] = useState("");
  const router = useRouter();

  const post = posts.find(item => item.id === postId);
  const commentsArr = posts.filter(item => item.id !== postId)
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:border-slate-600"
          >
            ← タイムラインへ戻る
          </Link>
        </div>

        {/* メインポスト */}
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-black/30">
          {/* ユーザー情報 */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-500 text-2xl font-bold text-white">
              {post.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-semibold text-white truncate">{post.name}</h2>
                <span className="text-sm text-slate-500 flex-shrink-0">{post.account_id}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{"9999時間前"}</p>
            </div>
          </div>

          {/* ポストコンテンツ */}
          <div className="mb-6">
            <p className="text-base leading-relaxed text-slate-100">{post.content}</p>
          </div>

          {/* ポスト統計 */}
          <div className="mb-8 flex gap-6 border-t border-b border-slate-800 py-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-slate-400">いいね</p>
              <p className="mt-1 text-2xl font-bold text-white">{post.likes_count}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-slate-400">コメント</p>
              <p className="mt-1 text-2xl font-bold text-white">{commentsArr.length}</p>
            </div>
          </div>

          {/* コメント入力 */}
          <div className="mb-8 space-y-4">
            <textarea
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:bg-slate-950/70"
              rows={3}
              placeholder="コメントを追加する"
              value={inputComment}
              onChange={(event) => setInputComment(event.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (inputComment.trim() === "") return;
                    await supabase.from("posts").insert(
                      {
                        content: inputComment,
                        user_id,
                        parent_id: postId
                      }
                    );

                    setInputComment("");
                    router.refresh()
                }}
                className="inline-flex items-center rounded-lg bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={inputComment.trim() === ""}
              >
                コメントを追加
              </button>
            </div>
          </div>

          {/* コメント一覧 */}
          <div className="border-t border-slate-800 pt-8">
            <h3 className="text-lg font-semibold text-white mb-6">
              コメント <span className="text-slate-500 font-normal">({commentsArr.length})</span>
            </h3>
            <div className="space-y-4">
              {commentsArr.length > 0 ? (
                commentsArr.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/60 to-sky-500/60 text-sm font-bold text-white">
                      {comment.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 rounded-lg bg-slate-800/50 p-4">
                      <p className="text-sm font-semibold text-slate-100">{comment.name}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">コメントはまだありません</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}