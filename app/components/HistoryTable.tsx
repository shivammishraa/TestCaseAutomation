import { Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

interface HistoryItem {
  _id: string;
  jiraTicketKey: string;
  status: "success" | "failed";
  createdAt: string;
  summary?: string;
}

interface HistoryTableProps {
  data: any[];
  onDownload: (generationId: string, ticketKey: string) => void; 
}

export default function HistoryTable({ data, onDownload }: HistoryTableProps) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-4 text-sm font-semibold text-slate-600">Ticket ID</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Issue Summary</th>
            <th className="p-4 text-sm font-semibold text-slate-600">Date Generated</th>
            <th className="p-4 text-sm font-semibold text-slate-600 text-right px-8">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {safeData.length === 0 ? (
            <tr><td colSpan={4} className="p-12 text-center text-slate-400">No history found.</td></tr>
          ) : (
            safeData.map((item) => (
              <tr key={item.generationId} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                    {item.jiraTicketKey}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {item.status === "success" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 size={12} /> COMPLETED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                        <AlertCircle size={12} /> FAILED
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-4 text-slate-500 text-sm">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 px-4">
                    <button
                      onClick={() => onDownload(item.generationId, item.jiraTicketKey)}
                      // Only allow download if status is success
                      disabled={item.status !== "success"}
                      className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all border ${item.status === "success"
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border-blue-100 shadow-sm"
                          : "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed"
                        }`}
                    >
                      <Download size={14} /> Download Excel
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}