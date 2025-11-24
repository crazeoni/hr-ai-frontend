// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

// At the top of your component
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleIndex() {
    setIndexing(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/index-hr`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
      setMessage(`Indexed ${data.indexed_chunks} chunks.`);
    } catch (e: any) {
      setMessage(`Indexing failed: ${e.message}`);
    } finally {
      setIndexing(false);
    }
  }

  async function handleAsk(e?: React.FormEvent) {
    e?.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));

      setAnswer(data.answer || data.summary || "(no answer)");
      setSources(data.sources || []);
    } catch (e: any) {
      setMessage(`Query failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">HR AI Assistant</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask questions about the HR document — powered by your RAG backend.
          </p>
        </header>

        <section className="mb-6 flex gap-3">
          <button
            onClick={handleIndex}
            disabled={indexing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-60"
          >
            {indexing ? "Indexing…" : "Index HR Document"}
          </button>

          <button
            onClick={() => {
              setQuestion("");
              setAnswer("");
              setSources([]);
              setMessage(null);
            }}
            className="px-4 py-2 bg-gray-100 rounded-md"
          >
            Reset
          </button>
        </section>

        <form onSubmit={handleAsk} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Question</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-200"
              placeholder="E.g. How many vacation days do I get?"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Asking…" : "Ask"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md">
            {message}
          </div>
        )}

        {answer && (
          <article className="mt-6">
            <h3 className="text-lg font-semibold">Answer</h3>
            <div className="mt-2 p-4 bg-slate-50 border rounded-md">{answer}</div>

            {sources.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-700">
                  Sources (Top Matches)
                </h4>
                <ul className="mt-2 space-y-2">
                  {sources.map((s, i) => (
                    <li
                      key={i}
                      className="p-3 bg-white border rounded-md text-sm whitespace-pre-wrap"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}

        <footer className="mt-8 text-xs text-slate-400">
          Ready for Vercel / Bolt deployment.
          <br />
          Set NEXT_PUBLIC_API_URL for remote backend.
        </footer>
      </div>
    </main>
  );
}
