import { SuccessCase } from "../types";
import { ExternalLink, FileText, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { motion } from "motion/react";

interface CaseCardProps {
  caseData: SuccessCase;
  isAdmin: boolean;
  onEdit?: (caseData: SuccessCase) => void;
  onDelete?: (id: string) => any;
  key?: string | number;
}

export function CaseCard({ caseData, isAdmin, onEdit, onDelete }: CaseCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-dati-blue hover:shadow-xl hover:shadow-dati-blue/5 transition-all group flex flex-col h-[280px]"
    >
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-1">
            {caseData.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="tag-base bg-dati-blue/10 text-dati-blue"
              >
                {tag}
              </span>
            ))}
          </div>
          {isAdmin && (
            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit?.(caseData)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-dati-blue transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete?.(caseData.id)}
                className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-3">
          {caseData.title}
        </h3>

        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-auto">
          {caseData.tags.slice(1, 4).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold text-slate-400 uppercase tracking-tight"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-50 mt-auto bg-slate-50/30">
        <div className="grid grid-cols-3 gap-2">
          <a
            href={caseData.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-center flex items-center justify-center"
          >
            Blog
          </a>
          
          {caseData.pdfUrl ? (
            <a
              href={caseData.pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-center flex items-center justify-center"
            >
              PDF
            </a>
          ) : <div className="btn-outline opacity-30 pointer-events-none text-center">PDF</div>}

          {caseData.pngUrl ? (
            <a
              href={caseData.pngUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-center flex items-center justify-center"
            >
              PNG
            </a>
          ) : <div className="btn-outline opacity-30 pointer-events-none text-center">PNG</div>}
        </div>
      </div>
    </motion.div>
  );
}
