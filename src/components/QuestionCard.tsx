/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InequalityOperator, Question } from '../types/inequality';
import { Minus, Plus, CheckCircle2, RotateCcw, ChevronRight, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  currentQuestion: Question | null;
  selectedOperator: InequalityOperator;
  selectedBoundary: number;
  onOperatorChange: (op: InequalityOperator) => void;
  onBoundaryChange: (val: number) => void;
  onCheckAnswer: () => void;
  onTryAgain: () => void;
  onNextQuestion: () => void;
  isCorrect: boolean | null;
  mode: 'challenge' | 'explore';
  questionIndex?: number;
  totalQuestions?: number;
  onToggleHint?: () => void;
  showHint?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  selectedOperator,
  selectedBoundary,
  onOperatorChange,
  onBoundaryChange,
  onCheckAnswer,
  onTryAgain,
  onNextQuestion,
  isCorrect,
  mode,
  questionIndex = 0,
  totalQuestions = 8,
  onToggleHint,
  showHint = false,
}) => {
  const operators: { id: InequalityOperator; label: string; name: string; circleType: string; direction: string }[] = [
    { id: '<', label: 'x < a', name: 'Strictly less than', circleType: 'Open circle', direction: 'Points Left' },
    { id: '<=', label: 'x ≤ a', name: 'Less than or equal', circleType: 'Filled circle', direction: 'Points Left' },
    { id: '>', label: 'x > a', name: 'Strictly greater than', circleType: 'Open circle', direction: 'Points Right' },
    { id: '>=', label: 'x ≥ a', name: 'Greater than or equal', circleType: 'Filled circle', direction: 'Points Right' },
  ];

  const handleBoundaryStep = (delta: number) => {
    const nextVal = Math.max(-100, Math.min(100, selectedBoundary + delta));
    onBoundaryChange(nextVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onBoundaryChange(Math.max(-100, Math.min(100, parsed)));
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition-all">
      {/* Top Header / Mode row */}
      {mode === 'challenge' && currentQuestion ? (
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              Problem {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Grade 7 Standards (Limit: -100 to 100)
            </span>
          </div>

          {currentQuestion.hint && (
            <button
              onClick={onToggleHint}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50"
              title="Toggle Hint"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs font-medium text-slate-500">
          <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md font-semibold">
            Free Exploration Mode
          </span>
          <span>Set any inequality and test points (Limit: -100 to 100)</span>
        </div>
      )}

      {/* Primary Goal / Problem Statement */}
      <div className="mb-5">
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
          {mode === 'challenge' ? 'Target Inequality' : 'Configure Inequality'}
        </h2>
        {mode === 'challenge' && currentQuestion ? (
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
              {currentQuestion.title}
            </div>
            {currentQuestion.description && (
              <p className="text-sm text-slate-600 mt-1">
                {currentQuestion.description}
              </p>
            )}
          </div>
        ) : (
          <p className="text-lg font-bold text-[#172554]">
            Build and visualize any linear inequality on the number line (-100 to 100)
          </p>
        )}

        {/* Expandable Hint Box */}
        {showHint && currentQuestion?.hint && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed transition-all">
            <strong className="font-semibold block mb-0.5 text-amber-950">Teacher Tip:</strong>
            {currentQuestion.hint}
          </div>
        )}
      </div>

      {/* Interactive Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Operator Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            1. Select Inequality Operator
          </label>
          <div className="grid grid-cols-2 gap-2">
            {operators.map((op) => {
              const isActive = selectedOperator === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => onOperatorChange(op.id)}
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <span className="text-lg font-mono font-bold tracking-wide">
                    {op.label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {op.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {op.circleType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Boundary Value Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            2. Adjust Boundary Value (a)
          </label>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between h-[calc(100%-1.75rem)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleBoundaryStep(-10)}
                  disabled={selectedBoundary <= -100}
                  className="px-2 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold shadow-xs transition-all"
                  title="Jump -10"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleBoundaryStep(-1)}
                  disabled={selectedBoundary <= -100}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xs"
                  aria-label="Decrease boundary value by 1"
                  title="Decrease 1"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center flex-1">
                <input
                  type="number"
                  min={-100}
                  max={100}
                  value={selectedBoundary}
                  onChange={handleInputChange}
                  className="w-24 text-center font-mono text-2xl font-bold text-[#172554] bg-white border border-slate-200 rounded-lg py-1 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                  aria-label="Boundary number input"
                />
                <span className="text-[11px] text-slate-500 mt-1">Limit: -100 to 100</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleBoundaryStep(1)}
                  disabled={selectedBoundary >= 100}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-xs"
                  aria-label="Increase boundary value by 1"
                  title="Increase 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBoundaryStep(10)}
                  disabled={selectedBoundary >= 100}
                  className="px-2 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono font-bold shadow-xs transition-all"
                  title="Jump +10"
                >
                  +10
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px]">Your graph represents:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded">
                x {selectedOperator === '<=' ? '≤' : selectedOperator === '>=' ? '≥' : selectedOperator} {selectedBoundary}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {mode === 'challenge' ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCheckAnswer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-sm hover:shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check Answer</span>
              </button>

              {isCorrect !== null && (
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Try Again</span>
                </button>
              )}
            </div>

            {isCorrect === true && (
              <button
                type="button"
                onClick={onNextQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-xs animate-bounce"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-slate-500">
            <span>Directly interact with the number line above or use the buttons to inspect changes in real time.</span>
            <button
              type="button"
              onClick={() => {
                onOperatorChange('>');
                onBoundaryChange(0);
              }}
              className="text-xs text-indigo-600 font-medium hover:underline"
            >
              Reset to x &gt; 0
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
