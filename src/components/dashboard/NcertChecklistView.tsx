import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { getNcertChapters, NcertSubjectGroup, NcertChapter } from '../../lib/ncert-data';
import { dbService } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Search,
  Sparkles,
  Award,
  Layers,
  Check,
} from 'lucide-react';

interface NcertChecklistViewProps {
  profile: UserProfile;
  onRevisionUpdated?: () => void;
}

export const NcertChecklistView: React.FC<NcertChecklistViewProps> = ({
  profile,
  onRevisionUpdated,
}) => {
  const [subjectGroups, setSubjectGroups] = useState<NcertSubjectGroup[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [revisedMap, setRevisedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const groups = getNcertChapters(profile.grade, profile.stream);
    setSubjectGroups(groups);
    const state = dbService.getChapterRevisionState(profile.id);
    setRevisedMap(state);
  }, [profile.id, profile.grade, profile.stream]);

  const allChapters: NcertChapter[] = subjectGroups.flatMap((g) => g.chapters);
  const totalChapters = allChapters.length;
  const revisedCount = allChapters.filter((c) => revisedMap[c.id]).length;
  const percentage = totalChapters > 0 ? Math.round((revisedCount / totalChapters) * 100) : 0;

  const handleToggle = async (chapterId: string) => {
    const nextVal = await dbService.toggleChapterRevised(profile.id, chapterId);
    setRevisedMap((prev) => ({ ...prev, [chapterId]: nextVal }));

    if (nextVal) {
      // Small celebratory milestone if 100% or every 5th chapter
      const newTotalRevised = revisedCount + 1;
      if (newTotalRevised === totalChapters || newTotalRevised % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }

    onRevisionUpdated?.();
  };

  // Filtered chapters
  const filteredChapters = allChapters.filter((c) => {
    const matchesSubject = activeSubject === 'All' || c.subject === activeSubject;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  if (profile.grade === 'Class 8') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        Chapter-wise NCERT syllabus checklist is available for Classes 9, 10, 11, and 12.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              NCERT Syllabus Checklist
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-semibold">
              {profile.grade} {profile.stream ? `(${profile.stream})` : ''}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Official NCERT Chapter Tracker
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Check off chapters as you revise them. Real-time stats are mirrored to your syllabus revision chart.
          </p>
        </div>

        {/* Real-time Revision Gauge */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-white">Syllabus Revised</div>
            <div className="text-xs font-mono text-emerald-400">
              {revisedCount} of {totalChapters} Chapters
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-sm">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Controls: Subject Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveSubject('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubject === 'All'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Subjects ({totalChapters})
            </button>
            {subjectGroups.map((g) => {
              const groupRevised = g.chapters.filter((c) => revisedMap[c.id]).length;
              return (
                <button
                  key={g.subject}
                  onClick={() => setActiveSubject(g.subject)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeSubject === g.subject
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{g.subject}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({groupRevised}/{g.chapters.length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Overall Syllabus Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall NCERT Revision Progress</span>
            <span className="font-bold text-emerald-400">{percentage}% Completed</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-2.5 pt-2">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No chapters match your search query.
            </div>
          ) : (
            filteredChapters.map((chap) => {
              const isRevised = Boolean(revisedMap[chap.id]);
              return (
                <div
                  key={chap.id}
                  onClick={() => handleToggle(chap.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                    isRevised
                      ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600/60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    {/* Checkbox Icon */}
                    <div className="shrink-0 text-slate-500 transition">
                      {isRevised ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Ch {chap.chapterNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 font-semibold text-indigo-300">
                          {chap.subject}
                        </span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate mt-0.5 ${
                          isRevised ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {chap.name}
                      </p>
                    </div>
                  </div>

                  {/* Revised Pill Button */}
                  <div className="shrink-0">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition flex items-center gap-1.5 ${
                        isRevised
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isRevised && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{isRevised ? 'Revised' : 'Mark Revised'}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
