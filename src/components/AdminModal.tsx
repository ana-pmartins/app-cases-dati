import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Sparkles } from "lucide-react";
import { SuccessCase } from "../types";
import { motion } from "motion/react";
import { suggestTags } from "../services/geminiService";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<SuccessCase>) => Promise<void>;
  initialData?: SuccessCase | null;
}

export function AdminModal({ isOpen, onClose, onSave, initialData }: AdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState<Partial<SuccessCase>>({
    title: "",
    blogUrl: "",
    pdfUrl: "",
    pngUrl: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        blogUrl: "",
        pdfUrl: "",
        pngUrl: "",
        tags: [],
      });
    }
  }, [initialData, isOpen]);

  const handleAnalyzeBlog = async () => {
    if (!formData.blogUrl) {
      alert("Por favor, insira a URL do blog primeiro.");
      return;
    }
    
    setAnalyzing(true);
    try {
      console.log("[Admin] Fetching blog content via server proxy...");
      const response = await fetch(`/api/fetch-blog?url=${encodeURIComponent(formData.blogUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || "Erro ao buscar blog.");
      }

      const data = await response.json();
      
      if (data.content && data.content.length > 50) {
        console.log(`[Admin] Content received (${data.content.length} chars). Suggesting tags...`);
        const suggestions = await suggestTags(data.content);
        
        if (suggestions.length > 0) {
          const currentTags = formData.tags || [];
          const mergedTags = Array.from(new Set([...currentTags, ...suggestions]));
          setFormData(prev => ({ ...prev, tags: mergedTags }));
          console.log("[Admin] Tags updated successfully.");
        } else {
          alert("A IA não conseguiu identificar tags específicas neste post.");
        }
      } else {
        alert("O conteúdo extraído do blog é insuficiente para análise.");
      }
    } catch (error: any) {
      console.error("[Admin] Analysis failed:", error);
      alert(`Falha na análise: ${error.message || "Erro desconhecido"}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      alert("Erro ao salvar o case. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dati-dark/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-dati-dark flex items-center gap-2 tracking-tight">
            {initialData ? "Editar Case" : "Novo Case de Sucesso"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título do Case</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue focus:border-transparent outline-none transition-all placeholder-slate-300"
              placeholder="Ex: Transformação Digital na Fintech X"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                Link do Blog
              </label>
              {formData.blogUrl && (
                <button
                  type="button"
                  onClick={handleAnalyzeBlog}
                  disabled={analyzing}
                  className="text-[10px] flex items-center gap-1.5 text-dati-purple hover:text-dati-blue font-black tracking-wider uppercase px-3 py-1.5 rounded-full bg-dati-purple/10 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {analyzing ? "Analisando..." : "Gerar Tags com IA"}
                </button>
              )}
            </div>
            <input
              required
              type="url"
              value={formData.blogUrl}
              onChange={(e) => setFormData({ ...formData, blogUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue focus:border-transparent outline-none transition-all placeholder-slate-300"
              placeholder="https://dati.com.br/blog/..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">URL PDF (One Page)</label>
              <input
                type="text"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue focus:border-transparent outline-none transition-all placeholder-slate-300 text-sm"
                placeholder="Link do arquivo PDF"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">URL PNG</label>
              <input
                type="text"
                value={formData.pngUrl}
                onChange={(e) => setFormData({ ...formData, pngUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue focus:border-transparent outline-none transition-all placeholder-slate-300 text-sm"
                placeholder="Link da imagem PNG"
              />
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Tags do Case</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-grow px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-dati-blue outline-none text-sm placeholder-slate-300"
                placeholder="Adicionar tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-dati-dark text-white rounded-lg font-bold text-sm hover:bg-dati-blue transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-500"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {formData.tags?.length === 0 && (
                <p className="text-xs text-slate-400 italic">Nenhuma tag.</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] py-3.5 px-4 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              style={{ backgroundColor: formData.title ? 'var(--color-dati-blue)' : '#cbd5e1' }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? "Salvar Alterações" : "Criar Case"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
