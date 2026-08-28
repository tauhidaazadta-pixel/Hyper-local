import React, { useState } from 'react';
import { FLUTTER_CODEBASE, FlutterCodeFile } from '../data/flutterCode';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  FolderTree,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterCodeFile>(FLUTTER_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename.split('/').pop() || 'file.dart';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Banner */}
      <div className="bg-[#0a1e3f] text-white rounded-2xl p-4 sm:p-5 mb-5 border border-blue-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
              Flutter Dart & Firestore Rules
            </span>
            <span className="text-xs text-blue-300">Production-Ready Architecture</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            Complete Flutter (Dart) Source Codebase
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Here are the complete Flutter files structured with clean Material 3, Provider state management, atomic Firestore queries for Single Master Product / Multiple Sellers, standalone POS, and Google Maps rider tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Active File'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Explorer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Sidebar: File Tree (4 Cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-blue-700" />
            Project File Tree
          </div>

          <div className="space-y-1 pt-1">
            {FLUTTER_CODEBASE.map((file) => {
              const isSelected = selectedFile.filename === file.filename;
              const isRules = file.filename.includes('firestore');

              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all text-xs ${
                    isSelected
                      ? 'bg-[#0f2b5c] text-white shadow-sm font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isRules ? (
                      <Flame className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                    ) : (
                      <FileCode className={`w-4 h-4 ${isSelected ? 'text-blue-200' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-mono text-xs truncate">{file.filename}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {file.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer & Highlight (8 Cols) */}
        <div className="md:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* File Tab Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-bold text-slate-100">{selectedFile.filename}</span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {selectedFile.code.split('\n').length} lines
            </div>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-blue-950/60 border-b border-blue-900 text-xs text-blue-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Code Body */}
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-text">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
