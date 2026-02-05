"use client";
import { useEffect, useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", designation: "" });

  useEffect(() => {
    // Get the data we saved during Login
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setProfile(JSON.parse(storedUser));
     }// else {
    //   router.push("/login");
    // }
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-slate-100 z-50 h-16 px-8 flex items-center justify-between">
      {/* Left Section: Profile based on Login info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <UserCircle size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-none">{profile.name || "Loading..."}</h3>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{profile.designation || "User"}</span>
        </div>
      </div>

      <div className="text-xl font-black italic text-slate-800 tracking-tighter">Test Case Generator<span className="text-blue-600">.AI</span></div>

      {/* Right Section: Logout */}
      <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-semibold">
        Logout <LogOut size={16} />
      </button>
    </nav>
  );
}