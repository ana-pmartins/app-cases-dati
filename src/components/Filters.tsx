import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { SuccessCase } from "../types";

interface FiltersProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Filters({ allTags, selectedTags, onTagsChange, searchQuery, onSearchChange }: FiltersProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
    onSearchChange("");
  };

  // Sort tags by frequency might be cool, but let's just sort alphabetically for now
  const sortedTags = [...allTags].sort();
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-dati-blue text-slate-400 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar cases por título ou tecnologia..."
          className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-dati-blue focus:border-transparent transition-all shadow-sm outline-none text-slate-700 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <Filter size={14} className="text-dati-blue" />
            <span>Filtros por Tag</span>
          </div>
          {(selectedTags.length > 0 || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase font-black text-dati-orange hover:brightness-110"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`tag-base transition-all border ${
                selectedTags.includes(tag)
                  ? "bg-dati-blue border-dati-blue text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-dati-blue hover:text-dati-blue"
              }`}
            >
              {tag}
            </button>
          ))}
          
          {sortedTags.length > 12 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-[10px] font-bold text-dati-purple hover:underline uppercase block w-full mt-2 text-left"
            >
              {showAllTags ? "Ver menos" : `Ver todas (+${sortedTags.length - 12})`}
            </button>
          )}
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">Selecionadas</span>
            {selectedTags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 px-2 py-0.5 bg-dati-blue/5 text-dati-blue rounded text-[10px] font-bold border border-dati-blue/10">
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-dati-dark transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
