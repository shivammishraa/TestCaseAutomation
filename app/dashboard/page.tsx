"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HistoryTable from "../components/HistoryTable";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Send, X } from "lucide-react";

interface HistoryItem {
  id: number;
  ticketId: string;
  summary: string;
  generatedAt: string;
  downloadUrl: string;
  testCases: any[];
}

export default function Dashboard() {
  const [jiraTicketKey, setJiraTicketKey] = useState("");
  const [useReasoning, setUseReasoning] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [viewData, setViewData] = useState<any[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Convert Base64 from BFF back to a Blob URL for downloading
      const byteCharacters = atob(result.excelFile);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
       // Add to history state immediately (at the top)
      const newEntry = {
        id: Date.now(),
        ticketId: result.ticketId,
        summary: result.summary,
        generatedAt: new Date().toISOString(),
        downloadUrl: url,
        testCases: result.testCases 
      };

      setHistory((prev) => [newEntry, ...prev]);
      setStatus("success");
      // fetchHistory(); // Still call this if you want to sync with DB
    } catch (error) {
      setStatus("idle");
      alert("Generation failed.");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-6xl mx-auto pt-20 px-6 pb-12">
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
              disabled={status === "loading" || status === "success"}
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
                className="w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
              >
                <Download size={20} /> Download Test File (Excel)
              </a>
            ) : (
               <button
              onClick={status === "idle" ? handleGenerate : undefined}
              disabled={!jiraTicketKey || status === "loading"}
              className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                status === "loading" ? "bg-slate-100 text-slate-400" : 
                status === "success" ? "bg-green-100 text-green-700 border border-green-200 cursor-default" : 
                "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
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
            <h3 className="text-xl font-bold text-slate-800">Recent Submissions</h3>
          </div>
          <HistoryTable data={history} onView={(data) => { setViewData(data); setIsModalOpen(true); }} />
        </section>
      </main>

      {/* --- PREVIEW MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Data Preview</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-auto bg-white">
                <table className="w-full border-collapse border border-slate-200 text-sm">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="border border-slate-300 p-2 text-left">ID</th>
                      <th className="border border-slate-300 p-2 text-left">Test</th>
                      <th className="border border-slate-300 p-2 text-left">Expected Result</th>
                      <th className="border border-slate-300 p-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewData?.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="border border-slate-200 p-2 font-mono">{row.TestCaseId || row.testCaseId}</td>
                        <td className="border border-slate-200 p-2">{row.Test || row.description}</td>
                        <td className="border border-slate-200 p-2">{row.Expected_Result}</td>
                        <td className="border border-slate-200 p-2">{row.type || 'Positive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
