"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HistoryTable from "../components/HistoryTable";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [jiraTicketKey, setJiraTicketKey] = useState("");
  const [useReasoning, setUseReasoning] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [history, setHistory] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // 1. Initial Load and dependency on 'status' to refresh history
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Main Trigger: Calls Backend to start AI generation
  const handleTriggerAI = async () => {
    if (!jiraTicketKey) return;
    setStatus("loading");

    try {
      // backend has an endpoint that just triggers the process
      const response = await fetch("http://localhost:5000/api/generate-testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jiraTicketKey, useReasoning }),
      });

      if (!response.ok) throw new Error("Backend Error");

      setStatus("success");
      setShowPopup(true);
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);
      
      // Refresh table immediately
      fetchHistory();
      
    } catch (error) {
      console.error("AI Trigger Error:", error);
      setStatus("idle");
      alert("Failed to start generation.");
    }
  };

  // 3. Download Logic: Triggered ONLY by the History Table button
  const handleDownloadExcel = async (ticketId: string) => {
    try {
      const response = await fetch("/api/generate-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jiraTicketKey: ticketId }),
      });

      if (!response.ok) throw new Error("Excel Generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SIT_${ticketId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Error downloading file.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle size={20} />
            Test cases generated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto pt-20 px-6 pb-12">
        <section className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generate SIT Test Cases</h2>
          
          <div className="w-full max-w-md space-y-4 mt-6">
            <input
              type="text"
              placeholder="Enter Jira Ticket ID"
              value={jiraTicketKey}
              onChange={(e) => setJiraTicketKey(e.target.value)}
              disabled={status === "loading"}
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium shadow-sm"
            />

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={useReasoning}
                onChange={(e) => setUseReasoning(e.target.checked)}
                disabled={status === "loading"}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 font-medium">Use Advanced Reasoning</span>
            </label>

            <button
              onClick={status === "idle" ? handleTriggerAI : undefined}
              disabled={!jiraTicketKey || status === "loading"}
              className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                status === "loading" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : 
                status === "success" ? "bg-green-100 text-green-700 border border-green-200 cursor-default" : 
                "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Processing...</span>
              ) : status === "success" ? (
                <span className="flex items-center gap-2"><CheckCircle size={20} /> Request Processed</span>
              ) : (
                <span className="flex items-center gap-2">Generate Test Cases <Send size={18} /></span>
              )}
            </button>

            {status === "success" && (
              <button
                onClick={() => { setStatus("idle"); setJiraTicketKey(""); }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Generate for another ticket
              </button>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Recent Submissions</h3>
          </div>
          <HistoryTable data={history} onDownload={handleDownloadExcel} />
        </section>
      </main>
    </div>
  );
}