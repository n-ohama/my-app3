"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({mode: isLogin ? 2 : 1, email, password})
    });
    const result = await res.json();
    if (!result.success) {
      alert("エラーです。" + result.error);
      return;
    }

    if (!isLogin) {
      const {error} = await supabase.from("users").insert(
        {
          id: result.uid,
          name: name,
          account_id: "@"+email.split("@")[0].toUpperCase(),
        }
      );

      if(error) console.error(error);
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-xl font-bold text-white">
            E
          </div>
          <h1 className="text-2xl font-semibold">{isLogin ? "ログイン" : "サインアップ"}</h1>
          <p className="mt-2 text-sm text-slate-400">{!isLogin ? "名前、" : ""}メールアドレスとパスワードで続けます</p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                名前
              </label>
              <input
                id="name"
                type="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                placeholder="名前。。。"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>

          {message ? (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {message}
            </p>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLogin ? "ログイン" : "サインアップ"}
          </button>
        </div>

        <p className="mt-6 text-left text-sm text-slate-400" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "サインアップ" : "ログイン"}
        </p>
      </div>
    </div>
  );
}