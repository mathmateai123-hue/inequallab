/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InequalityOperator, Question, ValidationFeedback } from './types/inequality';
import { GRADE_7_QUESTIONS } from './data/questions';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { InteractiveNumberLine, RangePreset } from './components/InteractiveNumberLine';
import { FeedbackCard } from './components/FeedbackCard';
import { TestValueProbe } from './components/TestValueProbe';
import { playSuccessSound, playErrorSound } from './utils/sound';

export default function App() {
  // Mode: guided practice challenge vs free sandbox
  const [mode, setMode] = useState<'challenge' | 'explore'>('challenge');

  // Streak state
  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('inequality_streak');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('inequality_best_streak');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [streakAnimated, setStreakAnimated] = useState<boolean>(false);

  // Audio preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Range limit state: 10, 50, or 100 (supports up to -100 to 100)
  const [range, setRange] = useState<RangePreset>(100);

  // Practice deck state
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const currentQuestion: Question = GRADE_7_QUESTIONS[questionIndex];

  // Student's current state on the number line (-100 to 100)
  const [selectedOperator, setSelectedOperator] = useState<InequalityOperator>('>');
  const [selectedBoundary, setSelectedBoundary] = useState<number>(0);

  // User interaction & validation states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shakeError, setShakeError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Probe testing value
  const [testPoint, setTestPoint] = useState<number | null>(null);

  // Default feedback message
  const [feedback, setFeedback] = useState<ValidationFeedback>({
    type: 'default',
    message: 'Move the endpoint and choose the correct inequality symbol.',
    detail: 'Drag the circle along the number line or select an operator above.',
  });

  // When changing questions, reset student inputs to an un-answered position
  const loadQuestion = (index: number) => {
    const q = GRADE_7_QUESTIONS[index];
    setQuestionIndex(index);
    setIsCorrect(null);
    setShakeError(false);
    setShowHint(false);
    setTestPoint(null);

    // Auto-adjust scale if target boundary is large
    if (Math.abs(q.target.boundary) > 50) {
      setRange(100);
    } else if (Math.abs(q.target.boundary) > 10) {
      setRange(50);
    }

    // Initial student position: offset from target so student actively constructs the graph
    const startBoundary = q.target.boundary === 0 ? (Math.abs(q.target.boundary) > 20 ? 10 : 2) : 0;
    const startOperator: InequalityOperator = q.target.operator === '>' ? '<' : '>';
    setSelectedBoundary(startBoundary);
    setSelectedOperator(startOperator);

    setFeedback({
      type: 'default',
      message: 'Move the endpoint and choose the correct inequality symbol.',
      detail: `Goal: Represent ${q.target.variable} ${q.target.operator === '<=' ? '≤' : q.target.operator === '>=' ? '≥' : q.target.operator} ${q.target.boundary}`,
    });
  };

  // Reset or initialize on mount
  useEffect(() => {
    loadQuestion(0);
  }, []);

  // Sync streak to storage
  useEffect(() => {
    try {
      localStorage.setItem('inequality_streak', String(streak));
      localStorage.setItem('inequality_best_streak', String(bestStreak));
    } catch {
      // Ignore
    }
  }, [streak, bestStreak]);

  // Ensure current boundary stays inside the visible scale
  useEffect(() => {
    if (Math.abs(selectedBoundary) > range) {
      if (Math.abs(selectedBoundary) > 50) {
        setRange(100);
      } else {
        setRange(50);
      }
    }
  }, [selectedBoundary, range]);

  // Handle Dragging State change from Number Line
  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
    if (dragging) {
      setFeedback({
        type: 'dragging',
        message: 'Keep going! Notice how the shaded region changes.',
        detail: `Boundary is moving across tick marks...`,
      });
      if (isCorrect !== null) {
        setIsCorrect(null);
      }
    } else {
      if (isCorrect === null) {
        setFeedback({
          type: 'default',
          message: 'Endpoint placed. Choose your symbol and press Check Answer.',
          detail: `Current value: ${selectedBoundary}`,
        });
      }
    }
  };

  // Handle operator change
  const handleOperatorChange = (op: InequalityOperator) => {
    setSelectedOperator(op);
    if (isCorrect !== null) {
      setIsCorrect(null);
    }
    setFeedback({
      type: 'default',
      message: 'Symbol updated! Check your endpoint position and click Check Answer.',
      detail: `Selected: x ${op === '<=' ? '≤' : op === '>=' ? '≥' : op} ${selectedBoundary}`,
    });
  };

  // Handle boundary change
  const handleBoundaryChange = (val: number) => {
    setSelectedBoundary(val);
    if (isCorrect !== null) {
      setIsCorrect(null);
    }
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (mode === 'explore') {
      setIsCorrect(true);
      if (soundEnabled) playSuccessSound(true);
      const isStrict = selectedOperator === '<' || selectedOperator === '>';
      setFeedback({
        type: 'correct',
        message: `Graph confirmed for x ${selectedOperator === '<=' ? '≤' : selectedOperator === '>=' ? '≥' : selectedOperator} ${selectedBoundary}.`,
        detail: isStrict
          ? 'Great job! The open circle means the endpoint is not included.'
          : 'The filled circle means the endpoint is included.',
      });
      return;
    }

    const target = currentQuestion.target;
    const boundaryMatches = selectedBoundary === target.boundary;
    const operatorMatches = selectedOperator === target.operator;

    if (boundaryMatches && operatorMatches) {
      // FULLY CORRECT!
      setIsCorrect(true);
      setShakeError(false);
      if (soundEnabled) playSuccessSound(true);

      // Increment Streak Counter & trigger celebratory animation
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
      setStreakAnimated(true);
      setTimeout(() => setStreakAnimated(false), 900);

      const isStrict = target.operator === '<' || target.operator === '>';
      const specificExplanation = isStrict
        ? 'Great job! The open circle means the endpoint is not included.'
        : 'The filled circle means the endpoint is included.';

      setFeedback({
        type: 'correct',
        message: 'Excellent! Your inequality is represented correctly.',
        detail: specificExplanation,
        isCorrect: true,
      });
    } else {
      // INCORRECT
      setIsCorrect(false);
      setShakeError(true);
      if (soundEnabled) playErrorSound(true);
      setTimeout(() => setShakeError(false), 500);

      // Reset current streak on mistake to motivate mastery
      setStreak(0);

      const targetIsRight = target.operator === '>' || target.operator === '>=';
      const studentIsRight = selectedOperator === '>' || selectedOperator === '>=';
      const directionMatches = targetIsRight === studentIsRight;

      const targetIsStrict = target.operator === '<' || target.operator === '>';
      const studentIsStrict = selectedOperator === '<' || selectedOperator === '>';
      const inclusionMatches = targetIsStrict === studentIsStrict;

      if (!directionMatches) {
        setFeedback({
          type: 'incorrect',
          message: 'Check which direction the solution extends. Greater than points right; less than points left.',
          detail: `The problem asks for ${target.operator === '<=' ? '≤' : target.operator === '>=' ? '≥' : target.operator}. Does the arrow point the right way?`,
          directionWrong: true,
        });
      } else if (!inclusionMatches) {
        const shouldBeOpen = targetIsStrict;
        setFeedback({
          type: 'incorrect',
          message: shouldBeOpen
            ? 'Check your endpoint circle: strict inequalities (< and >) require an open circle because the number is not included.'
            : 'Check your endpoint circle: inclusive inequalities (≤ and ≥) require a filled circle because the number is included.',
          detail: shouldBeOpen
            ? 'Change your operator to < or > for an open circle.'
            : 'Change your operator to ≤ or ≥ for a filled circle.',
          inclusionWrong: true,
        });
      } else if (!boundaryMatches) {
        setFeedback({
          type: 'incorrect',
          message: `Check your boundary number. Your endpoint is currently at ${selectedBoundary}, but the inequality specifies ${target.boundary}.`,
          detail: `Drag the circle handle along the number line or use the +/- buttons to set ${target.boundary}.`,
          boundaryWrong: true,
        });
      } else {
        setFeedback({
          type: 'incorrect',
          message: 'Both the boundary number and the inequality symbol need adjusting.',
          detail: `Review the target: ${currentQuestion.title}`,
        });
      }
    }
  };

  // Try Again Handler
  const handleTryAgain = () => {
    setIsCorrect(null);
    setShakeError(false);
    setFeedback({
      type: 'default',
      message: 'Move the endpoint and choose the correct inequality symbol.',
      detail: 'Adjust your boundary value or operator and check again.',
    });
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    const nextIndex = (questionIndex + 1) % GRADE_7_QUESTIONS.length;
    loadQuestion(nextIndex);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172554] flex flex-col items-center py-6 px-3 sm:px-6 md:px-8">
      {/* Main Container - Mobile first, responsive up to 860px max width for dedicated learning focus */}
      <main className="w-full max-w-4xl space-y-5">
        {/* Header with Streak Counter */}
        <Header
          mode={mode}
          onModeChange={(newMode) => {
            setMode(newMode);
            setIsCorrect(null);
            if (newMode === 'explore') {
              setFeedback({
                type: 'default',
                message: 'Sandbox active: move the boundary point and switch symbols to see the graph transform.',
                detail: 'Explore any number from -100 to 100 with the number line.',
              });
            } else {
              loadQuestion(questionIndex);
            }
          }}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
          streak={streak}
          bestStreak={bestStreak}
          streakAnimated={streakAnimated}
        />

        {/* Question & Configuration Card */}
        <div className={`transition-transform duration-300 ${shakeError ? 'animate-shake' : ''}`}>
          <QuestionCard
            currentQuestion={mode === 'challenge' ? currentQuestion : null}
            selectedOperator={selectedOperator}
            selectedBoundary={selectedBoundary}
            onOperatorChange={handleOperatorChange}
            onBoundaryChange={handleBoundaryChange}
            onCheckAnswer={handleCheckAnswer}
            onTryAgain={handleTryAgain}
            onNextQuestion={handleNextQuestion}
            isCorrect={isCorrect}
            mode={mode}
            questionIndex={questionIndex}
            totalQuestions={GRADE_7_QUESTIONS.length}
            onToggleHint={() => setShowHint(!showHint)}
            showHint={showHint}
          />
        </div>

        {/* Interactive Number Line Canvas (Limits -100 to 100) */}
        <section aria-label="Interactive Number Line Canvas" className="w-full">
          <InteractiveNumberLine
            min={-range}
            max={range}
            boundary={selectedBoundary}
            operator={selectedOperator}
            onBoundaryChange={handleBoundaryChange}
            onRangeChange={(newRange) => setRange(newRange)}
            onDragStateChange={handleDragStateChange}
            soundEnabled={soundEnabled}
            testPoint={testPoint}
            highlightCorrect={isCorrect === true}
            highlightError={isCorrect === false}
          />
        </section>

        {/* Learning Feedback Card beneath the number line */}
        <section aria-label="Learning Feedback">
          <FeedbackCard
            feedback={feedback}
            operator={selectedOperator}
            boundary={selectedBoundary}
          />
        </section>

        {/* Conceptual Proof Tool: Test a Value Probe */}
        <section aria-label="Solution Value Verification">
          <TestValueProbe
            operator={selectedOperator}
            boundary={selectedBoundary}
            testPoint={testPoint}
            onSetTestPoint={setTestPoint}
          />
        </section>

        {/* Quick Reference Rules for Grade 7 */}
        <footer className="w-full bg-white/70 rounded-2xl border border-slate-200/70 p-4 text-xs text-slate-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Circle Types</span>
              <span>Open circle (○) for &lt; and &gt; (excluded). Filled circle (●) for ≤ and ≥ (included).</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Ray Direction</span>
              <span>Greater than (&gt;, ≥) shades to the right. Less than (&lt;, ≤) shades to the left.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Number Line Limits</span>
              <span>Limits extend from -100 to 100 with switchable scale presets (±10, ±50, ±100).</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
