"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // MOCK LOGIN: Accept any credentials
    setTimeout(() => {
      const userData = {
        name: username,
        designation: "Tester"
      };
      
      localStorage.setItem("userToken", "poc-token-123");
      localStorage.setItem("userData", JSON.stringify(userData));
      
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black italic text-blue-600 mb-2">Test Case Generator</h1>
          <p className="text-slate-500 font-medium">Enter details to access the POC</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest">Username</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest">Password</label>
            <input 
              required
              type="password"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all"
              placeholder="keep an ultra secure password😤"
            />
          </div>

          <button 
            disabled={loading || !username}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}