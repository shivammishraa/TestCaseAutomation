import Link from "next/link";
import { Wand2, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-blue-50">
      <div className="text-center max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <Wand2 size={40} />
          </div>
        </div>
        
        <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 mb-6">
          SIT<span className="text-blue-600">.AI</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Automate SIT Manual Test Cases using AI. 
          Enter your username to access the dashboard.
        </p>

        <div className="flex justify-center">
          <Link href="/login" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
            Get Started (Log In)
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 opacity-60">
          <Feature icon={<Zap className="text-orange-500" />} title="Instant Gen" desc="Zero manual effort." />
          <Feature icon={<ShieldCheck className="text-green-500" />} title="SIT Ready" desc="Professional standards." />
          <Feature icon={<Wand2 className="text-purple-500" />} title="Jira Sync" desc="Direct flow." />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-2">{icon}</div>
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}