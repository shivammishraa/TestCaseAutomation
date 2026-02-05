"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HistoryTable from "../components/HistoryTable";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Send } from "lucide-react";

export default function Dashboard() {
  const [jiraTicketKey, setJiraTicketKey] = useState("");
  const [useReasoning, setUseReasoning] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [history, setHistory] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const user = { name: "Shivam M", designation: "Developer" };

  const handleGenerate = async () => {
    if (!jiraTicketKey) return;
    setStatus("loading");
    setDownloadUrl(null);

    try {
      const response = await fetch("/api/generate-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jiraTicketKey, useReasoning }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      // 1. Convert the response to a Blob (Binary Large Object)
      const blob = await response.blob();

      // 2. Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // 3. Set this URL to your "Success" state so the download button can use it
      setDownloadUrl(url);
      setStatus("success");

      // Optional: Trigger download automatically
      const a = document.createElement("a");
      a.href = url;
      a.download = `SIT_${jiraTicketKey}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      fetchHistory();
    } catch (error) {
      console.error("BFF Error:", error);
      setStatus("idle");
      alert("Generation failed. Please try again.");
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-6xl mx-auto pt-20 px-6 pb-12">
        {/* Top Section: Jira Input */}
        <section className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Generate SIT Test Cases
          </h2>
          <p className="text-slate-500 mb-8 text-center max-w-md">
            Enter the Jira Ticket ID to fetch details and generate manual test
            cases via AI.
          </p>

          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="e.g., VO-20249"
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
              <span className="text-sm text-slate-700 font-medium">
                Use Advanced Reasoning (Slower, More Detailed)
              </span>
            </label>

            {/* If status is success, we wrap the button in an <a> tag or handle click with downloadUrl */}
            {status === "success" && downloadUrl ? (
              <a
                href={downloadUrl}
                download={`SIT_${jiraTicketKey}.xlsx`}
                className="w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg"
              >
                <Download size={20} /> Download Test File (Excel)
              </a>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!jiraTicketKey || status === "loading"}
                className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status === "loading"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                  }`}
              >
                <AnimatePresence mode="wait">
                  {status === "idle" ? (
                    <motion.span key="idle" className="flex items-center gap-2">
                      Generate Test Cases <Send size={18} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="loading"
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="animate-spin" size={20} />{" "}
                      Processing...
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
            {status === "success" && (
              <button
                onClick={() => {
                  setStatus("idle");
                  setJiraTicketKey("");
                  setDownloadUrl(null);
                }}
                className="w-full text-sm text-slate-400 hover:text-slate-600 underline"
              >
                Generate for another ticket
              </button>
            )}
          </div>
        </section>
        {/* Lower Section: History Table */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 text-left">
              Recent Submissions (Last 30 Days)
            </h3>
            <span className="text-xs font-medium bg-slate-200 px-3 py-1 rounded-full text-slate-600">
              {history.length} Tickets
            </span>
          </div>
          {/* <HistoryTable data={history} /> */}
        </section>
      </main>
    </div>
  );
}
