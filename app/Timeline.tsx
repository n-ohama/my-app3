"use client"

import { useState } from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";
import PostArticle from "./PostArticle";

type Props = {
  user_id: string;
  posts: any[];
}

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
              <PostArticle key={post.id} post={post} user_id={user_id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
