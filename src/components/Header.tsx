/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Compass, BookOpen, Flame, Trophy } from 'lucide-react';

interface HeaderProps {
  mode: 'challenge' | 'explore';
  onModeChange: (mode: 'challenge' | 'explore') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  streak: number;
  bestStreak: number;
  streakAnimated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  soundEnabled,
  onSoundToggle,
  streak,
  bestStreak,
  streakAnimated,
}) => {
  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
          Interactive Number Line
        </h1>
        <p className="text-sm text-[#475569] font-medium mt-0.5">
          Explore inequalities visually.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        {/* Streak Counter - Visually Appealing Motivation Element */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
            streak > 0
              ? 'bg-amber-50/90 border-amber-300/80 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600'
          } ${streakAnimated ? 'scale-110 ring-2 ring-amber-400' : 'scale-100'}`}
          title={`Current Streak: ${streak} | Personal Best: ${bestStreak}`}
        >
          <div className="relative">
            <Flame
              className={`w-4 h-4 transition-transform duration-300 ${
                streak > 0
                  ? 'text-amber-500 fill-amber-500 animate-bounce'
                  : 'text-slate-400'
              }`}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold font-mono tabular-nums text-slate-800">
              {streak}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {streak === 1 ? 'streak' : 'streak'}
            </span>
          </div>

          {bestStreak > 0 && (
            <div className="hidden xs:flex items-center gap-0.5 pl-1.5 border-l border-amber-200/60 text-[10px] text-amber-800/80 font-medium font-mono">
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>{bestStreak}</span>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => onModeChange('challenge')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'challenge'
                ? 'bg-white text-[#172554] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Practice</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('explore')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'explore'
                ? 'bg-white text-[#172554] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sandbox</span>
          </button>
        </div>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={onSoundToggle}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-indigo-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};

