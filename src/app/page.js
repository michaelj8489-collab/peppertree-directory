// @ts-nocheck.
/* eslint-disable */
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
      setErrorMsg("Invalid credentials. Please try again.");
    } else if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    // Background: Your Jekyll Oak photo
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center p-4"
      style={{ backgroundImage: "url('/jekyll-oak.jpg')" }}
    >
      {/* The Login Card: Set to that classic Canva Cream color */}
      <div
        className={`max-w-md w-full bg-[#fdfaf0] rounded-2xl shadow-2xl border border-stone-300 transition-all duration-1000 ease-out overflow-hidden ${
          isWiping ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Your Canva Logo at the top of the box */}
        <div className="w-full">
          <img 
            src="/peppertree-logo.jpg" 
            alt="Peppertree Crossing" 
            className="w-full h-auto object-cover border-b border-stone-200"
          />
        </div>

        <div className="p-8 md:p-10">
          <p className="text-stone-500 text-center mb-8 text-sm uppercase tracking-[0.3em] font-cinzel">
            Resident Portal
          </p>

          {errorMsg && (
            <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-800 p-4 mb-6 rounded shadow-inner text-sm font-sans">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-800 font-bold mb-2 text-xs uppercase tracking-widest font-cinzel">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 text-black bg-white transition"
                placeholder="residents@peppertree.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-2 text-xs uppercase tracking-widest font-cinzel">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 text-black bg-white transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-cinzel font-bold tracking-widest py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 mt-4"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .font-cinzel {
          font-family: 'Cinzel', serif;
        }
      `}</style>
    </div>
  );
}