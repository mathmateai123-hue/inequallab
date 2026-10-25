/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InequalityOperator } from '../types/inequality';
import { Check, X, Search } from 'lucide-react';

interface TestValueProbeProps {
  operator: InequalityOperator;
  boundary: number;
  testPoint: number | null;
  onSetTestPoint: (val: number | null) => void;
}

export const TestValueProbe: React.FC<TestValueProbeProps> = ({
  operator,
  boundary,
  testPoint,
  onSetTestPoint,
}) => {
  const [inputValue, setInputValue] = useState<string>('4');

  const evaluates = (x: number): boolean => {
    switch (operator) {
      case '<':
        return x < boundary;
      case '<=':
        return x <= boundary;
      case '>':
        return x > boundary;
      case '>=':
        return x >= boundary;
    }
  };

  const getSymbol = (op: InequalityOperator) => {
    switch (op) {
      case '<=':
        return '≤';
      case '>=':
        return '≥';
      default:
        return op;
    }
  };

  const currentTestValue = testPoint !== null ? testPoint : parseInt(inputValue, 10);
  const isValidNumber = !isNaN(currentTestValue);
  const isSatisfied = isValidNumber ? evaluates(currentTestValue) : false;
  const isAtBoundary = isValidNumber && currentTestValue === boundary;

  const quickSamples = [-50, 0, boundary, boundary + 1, boundary - 1, 50];
  const uniqueSamples = Array.from(new Set(quickSamples)).filter((v) => v >= -100 && v <= 100).sort((a, b) => a - b);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs uppercase font-bold text-slate-700 tracking-wider">
            Test a Solution Value (Proof Check)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Substitute x into inequality (Range: -100 to 100)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Input box */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-slate-600">x =</span>
          <input
            type="number"
            min={-100}
            max={100}
            value={testPoint !== null ? testPoint : inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                onSetTestPoint(Math.max(-100, Math.min(100, val)));
              } else {
                onSetTestPoint(null);
              }
            }}
            placeholder="0"
            className="w-20 text-center font-mono font-bold text-base bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
          />
        </div>

        {/* Quick click suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Try:</span>
          {uniqueSamples.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setInputValue(String(val));
                onSetTestPoint(val);
              }}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                testPoint === val
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {val}
            </button>
          ))}
          {testPoint !== null && (
            <button
              type="button"
              onClick={() => onSetTestPoint(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result substitution box */}
      {isValidNumber && (
        <div
          className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${
            isSatisfied
              ? 'bg-teal-50/80 border-teal-200 text-teal-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {isSatisfied ? (
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-mono font-semibold">
                {currentTestValue} {getSymbol(operator)} {boundary}
              </span>
              {' is '}
              <strong className="font-bold">{isSatisfied ? 'TRUE (Solution!)' : 'FALSE (Not a Solution)'}</strong>
            </div>
          </div>

          <div className="text-[11px] text-right font-medium opacity-85 hidden sm:block">
            {isAtBoundary ? (
              isSatisfied ? (
                <span>Boundary is included (filled circle)</span>
              ) : (
                <span>Boundary excluded (open circle)</span>
              )
            ) : isSatisfied ? (
              <span>Lies in the shaded region</span>
            ) : (
              <span>Outside the shaded region</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
