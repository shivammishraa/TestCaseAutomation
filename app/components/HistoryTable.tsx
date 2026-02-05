import { Download, FileSpreadsheet } from "lucide-react";

interface HistoryTableProps {
  data: any[];
  onDownload: (ticketId: string) => void;
}

export default function HistoryTable({ data, onDownload }: HistoryTableProps) {
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
          {data.length === 0 ? (
            <tr><td colSpan={4} className="p-12 text-center text-slate-400">No history found.</td></tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                    {item.ticketId}
                  </span>
                </td>
                <td className="p-4 text-slate-700 font-medium text-sm">{item.summary}</td>
                <td className="p-4 text-slate-500 text-sm">
                  {new Date(item.generatedAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 px-4">
                    <button 
                      onClick={() => onDownload(item.ticketId)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-all border border-blue-100"
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