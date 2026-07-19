"use client"

import { useState } from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";

type Props = { user_id: string; posts: any[]; }
export default function Timeline({user_id, posts}: Props) {
  const router = useRouter();
  const [inputContent, setInputContent] = useState("");
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">タイムライン</h1>
              <p className="text-sm text-slate-400">みんなの最新の投稿です</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/account", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({mode: 3})
                });
                
                router.push("/login");
              }}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              ログアウト
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-500 font-bold text-white">
                あ
              </div>
              <div>
                <p className="font-semibold">あなた</p>
                <p className="text-sm text-slate-400">今の気持ちを共有しましょう</p>
              </div>
            </div>
            <textarea
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
              rows={3}
              placeholder="今日は何をしていましたか？"
              value={inputContent}
              onChange={(event) => setInputContent(event.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-slate-400">📷 📍 🎯</div>
              <button className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                onClick={async () => {
                  if (inputContent.trim() === "") return;
                  await supabase.from("posts").insert(
                    {
                      content: inputContent,
                      user_id: user_id
                    }
                  );

                  setInputContent("");
                  router.refresh()
                }}
              >
                投稿する
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
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
                  <span>🔁 {post.stats?.reposts}</span>
                  <span>❤️ {post.stats?.likes}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
