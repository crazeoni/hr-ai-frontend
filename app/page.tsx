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
"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hr-ai-frontend-drab.vercel.app";

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
          Built by Ozioma Isaiah  
          <br />© {new Date().getFullYear()} — All Rights Reserved.
          <br />
          <a 
            href="https://www.linkedin.com/in/ozioma-isaiah-29a198174/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 
              2.761 2.239 5 5 5h14c2.761 0 5-2.239 
              5-5v-14c0-2.761-2.239-5-5-5zm-11 
              19h-3v-10h3v10zm-1.5-11.268c-.966 
              0-1.75-.79-1.75-1.764s.784-1.764 
              1.75-1.764 1.75.79 1.75 
              1.764-.784 1.764-1.75 
              1.764zm13.5 11.268h-3v-5.604c0-1.337-.026-3.059-1.865-3.059-1.865 
              0-2.151 1.454-2.151 2.958v5.705h-3v-10h2.881v1.367h.041c.401-.76 
              1.379-1.562 2.836-1.562 3.034 0 3.594 
              2.01 3.594 4.623v5.572z"/>
            </svg>
            LinkedIn
          </a>
        </footer>
      </div>
    </main>
  );
}
