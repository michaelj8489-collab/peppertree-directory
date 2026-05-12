"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isWiping, setIsWiping] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsWiping(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); 

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg("Incorrect password or email. Please try again.");
    } else if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">
      <div
        className={`max-w-md w-full bg-white rounded-xl shadow-2xl p-10 border border-stone-200 transition-all duration-1000 ease-out overflow-hidden ${
          isWiping ? "max-height-wipe-in" : "max-height-0"
        }`}
      >
        {/* Main Title Section mimicking the new logo layout */}
        <div className="text-center mb-10">
          <h1 className="text-4xl text-slate-800 font-cinzel font-bold tracking-widest border-b-2 border-slate-200 pb-2 mb-2">
             PEPPERTREE
          </h1>
          <h2 className="text-xl text-slate-600 font-cinzel tracking-[0.5em]">
           CROSSING
          </h2>
        </div>

        <p className="text-stone-500 text-center mb-10 text-lg font-serif italic">
          Resident Document Portal
        </p>

        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-800 p-5 mb-8 rounded-r shadow-inner">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm uppercase tracking-widest font-cinzel">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-black bg-white transition"
              placeholder="residents@peppertree.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm uppercase tracking-widest font-cinzel">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-black bg-white transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-cinzel tracking-widest py-4 rounded shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Log In
          </button>
        </form>
      </div>

      <style jsx global>{`
        /* Importing Pinyon Script and Cinzel */
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cinzel:wght@400;700&display=swap');

        .font-pinyon {
          font-family: 'Pinyon Script', cursive;
        }

        .font-cinzel {
          font-family: 'Cinzel', serif;
        }

        .max-height-0 {
          max-height: 0;
          opacity: 0;
        }

        .max-height-wipe-in {
          animation: verticalWipeIn 1.2s ease-out forwards;
        }

        @keyframes verticalWipeIn {
          0% {
            max-height: 0;
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            max-height: 800px;
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}