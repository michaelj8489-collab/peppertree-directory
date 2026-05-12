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
        {/* Main Title using Luxurious Roman */}
        <h1 className="text-5xl text-center text-slate-800 mb-4 font-luxurious tracking-wide">
          Peppertree Directory
        </h1>

        {/* Subtitle using Playfair Display */}
        <p className="text-stone-600 text-center mb-10 text-xl font-playfair italic">
          Welcome to your community. Log in to access shared documents.
        </p>

        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-800 p-5 mb-8 rounded-r shadow-inner">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-7">
          <div>
            <label className="block text-slate-700 font-semibold mb-3 text-lg font-playfair">
              Community Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-lg text-black bg-white transition duration-300"
              placeholder="residents@peppertree.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-3 text-lg font-playfair">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-lg text-black bg-white transition duration-300"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-5 px-5 rounded-lg focus:outline-none shadow-md text-xl font-playfair tracking-wider transition-all duration-300 transform hover:-translate-y-1"
          >
            Log In
          </button>
        </form>
      </div>

      <style jsx global>{`
        /* Importing both Luxurious Roman and Playfair Display from Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Luxurious+Roman&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .font-luxurious {
          font-family: 'Luxurious Roman', serif;
        }

        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        .max-height-0 {
          max-height: 0;
          opacity: 0;
        }

        .max-height-wipe-in {
          animation: verticalWipeIn 1s ease-out forwards;
        }

        @keyframes verticalWipeIn {
          0% {
            max-height: 0;
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            max-height: 700px;
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}