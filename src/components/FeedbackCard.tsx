/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ValidationFeedback } from '../types/inequality';
import { CheckCircle2, AlertCircle, Sparkles, MoveHorizontal } from 'lucide-react';

interface FeedbackCardProps {
  feedback: ValidationFeedback;
  operator: '<' | '<=' | '>' | '>=';
  boundary: number;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  operator,
  boundary,
}) => {
  const isStrict = operator === '<' || operator === '>';

  // Visual style variants based on type
  const getContainerStyle = () => {
    switch (feedback.type) {
      case 'correct':
        return 'bg-teal-50/90 border-teal-200 text-teal-950 shadow-xs ring-1 ring-teal-500/20';
      case 'incorrect':
        return 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs ring-1 ring-rose-500/20';
      case 'dragging':
        return 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs ring-1 ring-indigo-500/20';
      default:
        return 'bg-white border-slate-200 text-slate-800 shadow-xs';
    }
  };

  const getIcon = () => {
    switch (feedback.type) {
      case 'correct':
        return <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />;
      case 'incorrect':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'dragging':
        return <MoveHorizontal className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${getContainerStyle()}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight">
              {feedback.type === 'correct' && 'Excellent! Your inequality is represented correctly.'}
              {feedback.type === 'incorrect' && 'Not quite yet — Let’s adjust:'}
              {feedback.type === 'dragging' && 'Adjusting Endpoint'}
              {feedback.type === 'default' && 'Next Step'}
            </h4>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline tabular-nums">
              Point: x = {boundary} ({isStrict ? 'Open Circle' : 'Filled Circle'})
            </span>
          </div>

          <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-90 font-medium">
            {feedback.message}
          </p>

          {feedback.detail && (
            <p className="text-xs mt-1.5 pt-1.5 border-t border-black/5 font-normal opacity-85">
              {feedback.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
