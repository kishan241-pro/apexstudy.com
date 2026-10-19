import React, { useState, useEffect } from 'react';
import { dbService, getSupabaseConfig, updateSupabaseCredentials } from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../../lib/schema-sql';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  ShieldCheck,
  Key,
  Globe,
  Save,
  HelpCircle,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputAnonKey, setInputAnonKey] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);

  const [status, setStatus] = useState<{
    configured: boolean;
    url: string;
    allCoreReady: boolean;
    tables: {
      profiles: boolean;
      todo_tasks: boolean;
      chapter_revisions: boolean;
      study_materials: boolean;
      daily_task_logs: boolean;
    };
    errorDetails?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await dbService.checkDatabaseStatus();
      setStatus(res);
      if (!res.configured) {
        setShowConfigForm(true);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setInputUrl(cfg.url || '');
      setInputAnonKey(cfg.anonKey || '');
      if (!cfg.url || !cfg.anonKey) {
        setShowConfigForm(true);
      }
      fetchStatus();
    }
  }, [isOpen]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputAnonKey.trim()) return;

    setLoading(true);
    const success = updateSupabaseCredentials(inputUrl.trim(), inputAnonKey.trim());

    if (success) {
      setSaveMessage('Saved successfully! Testing table connection...');
      await fetchStatus();
      setTimeout(() => setSaveMessage(null), 4000);
    } else {
      setSaveMessage('Invalid format. URL must start with https:// and Anon key must be valid.');
      setLoading(false);
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  const projectId = status?.url && status.url.startsWith('https://')
    ? status.url.replace('https://', '').split('.')[0]
    : 'your-project-id';
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Supabase Cloud Integration</span>
                {status?.allCoreReady ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Cloud Live & Healthy
                  </span>
                ) : status?.configured ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Connecting Tables
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Needs Credentials
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
                {status?.url || 'No Supabase URL connected yet'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Dual-Engine Guarantee Alert */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-indigo-200">
                Zero-Downtime Dual-Engine Architecture
              </p>
              <p className="text-slate-300 leading-relaxed">
                ApexStudy automatically mirrors your students, daily 5 AI tasks, Pomodoro logs, and NCERT revisions into Supabase cloud storage, with continuous local fallback.
              </p>
            </div>
          </div>

          {/* Connect / Update Supabase Credentials Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Add Your Supabase Credentials Here
                </h3>
              </div>
              <button
                onClick={() => setShowConfigForm(!showConfigForm)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {showConfigForm ? 'Hide Form' : 'Edit Credentials'}
              </button>
            </div>

            {showConfigForm && (
              <form onSubmit={handleSaveCredentials} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project URL (VITE_SUPABASE_URL)</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Anon Public API Key (VITE_SUPABASE_ANON_KEY)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inputAnonKey}
                    onChange={(e) => setInputAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {saveMessage && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-xs text-indigo-300">
                    {saveMessage}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://supabase.com/dashboard/project/_/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Where do I find these in Supabase?</span>
                  </a>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Connect</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Table Verification Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                PostgreSQL Tables Verification
              </span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-Test Live Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: 'public.profiles', ready: status?.tables.profiles, desc: 'Student accounts & is_premium status' },
                { name: 'public.todo_tasks', ready: status?.tables.todo_tasks, desc: 'Daily 5 AI tasks & XP' },
                { name: 'public.chapter_revisions', ready: status?.tables.chapter_revisions, desc: 'NCERT chapter checklist' },
                { name: 'public.study_materials', ready: status?.tables.study_materials, desc: 'AI Summaries, quizzes & cards' },
                { name: 'public.daily_task_logs', ready: status?.tables.daily_task_logs, desc: 'Monthly progress records' },
              ].map((tb) => (
                <div
                  key={tb.name}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    tb.ready
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold">{tb.name}</div>
                    <div className="text-[10px] text-slate-400">{tb.desc}</div>
                  </div>
                  <div>
                    {tb.ready ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Local Cache</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click SQL Script Generator */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-white">
                  1-Click SQL Schema Setup Script
                </h3>
                <p className="text-[11px] text-slate-400">
                  Run this in your Supabase SQL Editor to provision all tables & `is_premium` column.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySQL}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Script!' : 'Copy SQL Script'}</span>
                </button>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1"
                >
                  <span>Open Supabase SQL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-400 overflow-x-auto max-h-24 border border-slate-800">
              {SUPABASE_SQL_SCHEMA.slice(0, 400)}...
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Status:{' '}
            <strong className={status?.allCoreReady ? 'text-emerald-400' : 'text-amber-400'}>
              {status?.allCoreReady ? 'Supabase Connected' : 'Local Fallback Ready'}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusModal;
