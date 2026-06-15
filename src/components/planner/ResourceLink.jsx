import React from "react";
import { 
  Play, 
  BookOpen, 
  Github, 
  Code2, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from "lucide-react";

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ResourceIcon = ({ type, isSearch }) => {
  if (isSearch) return <ExternalLink className="w-5 h-5" />;
  switch (type) {
    case 'video': return <Play className="w-5 h-5" />;
    case 'article': return <BookOpen className="w-5 h-5" />;
    case 'repo': return <Github className="w-5 h-5" />;
    case 'documentation': return <Code2 className="w-5 h-5" />;
    case 'practice': return <CheckCircle2 className="w-5 h-5" />;
    case 'documentary': return <BookOpen className="w-5 h-5" />;
    default: return <BookOpen className="w-5 h-5" />;
  }
};

export function ResourceLink({ resource, feedbackStatus = {}, onFeedback }) {
  const { title = "Resource", url = "#", type = "article", difficulty_level } = resource || {};
  
  const isValid = (u) => {
    try {
      return u && u.startsWith('http') && new URL(u);
    } catch {
      return false;
    }
  };

  const isActuallyValid = isValid(url);
  const status = feedbackStatus[url];
  
  // Generate fallback if invalid
  let displayUrl = url;
  let isFallback = false;
  
  if (!isActuallyValid) {
    const query = encodeURIComponent(title);
    displayUrl = type === 'video' 
      ? `https://www.youtube.com/results?search_query=${query}`
      : `https://www.google.com/search?q=${query}`;
    isFallback = true;
  }

  const isSearch = isFallback || type === 'search' || (url && url.includes('search_query'));

  return (
    <div className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 group ${
      isSearch 
        ? 'bg-purple-950/15 backdrop-blur-md border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]' 
        : 'bg-slate-900/40 backdrop-blur-md border-slate-800/80 hover:border-purple-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.04)] hover:-translate-y-0.5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-all ${
            isFallback ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
            isSearch ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800/80 group-hover:border-purple-500/20 group-hover:text-purple-400 group-hover:bg-purple-500/5'
          }`}>
            <ResourceIcon type={type} isSearch={isSearch} />
          </div>
          <div>
            <h5 className="font-bold text-white line-clamp-1 text-sm group-hover:text-purple-300 transition-colors">{title}</h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider bg-slate-950/60 px-1.5 py-0.5 rounded-md border border-slate-800">
                {isFallback ? 'Search' : type}
              </span>
              {difficulty_level && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                    difficulty_level === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    difficulty_level === 'Intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  }`}>
                    {difficulty_level}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all border border-transparent hover:border-purple-500/20"
          title={isSearch ? "Open Search Results" : "Open Resource"}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {isFallback && (
        <div className="mb-3 px-3 py-1.5 bg-amber-500/5 rounded-xl border border-amber-500/15 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/80">Search Fallback Generated</span>
        </div>
      )}

      {onFeedback && (
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-800/80">
          <button
            onClick={() => onFeedback(url, 'useful')}
            disabled={status === 'useful'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border ${status === 'useful'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/5'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border-transparent hover:border-emerald-500/10'
              }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Useful
          </button>
          <button
            onClick={() => onFeedback(url, 'not_useful')}
            disabled={status === 'not_useful'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border ${status === 'not_useful'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-md shadow-rose-500/5'
              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/10'
              }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" /> Bad link
          </button>
        </div>
      )}
    </div>
  );
}
