/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { InequalityOperator } from '../types/inequality';
import { playSnapSound } from '../utils/sound';

export type RangePreset = 10 | 50 | 100;

interface InteractiveNumberLineProps {
  min: number;
  max: number;
  boundary: number;
  operator: InequalityOperator;
  onBoundaryChange: (val: number) => void;
  onRangeChange?: (range: RangePreset) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  soundEnabled?: boolean;
  testPoint?: number | null;
  highlightCorrect?: boolean;
  highlightError?: boolean;
}

export const InteractiveNumberLine: React.FC<InteractiveNumberLineProps> = ({
  min = -100,
  max = 100,
  boundary,
  operator,
  onBoundaryChange,
  onRangeChange,
  onDragStateChange,
  soundEnabled = true,
  testPoint = null,
  highlightCorrect = false,
  highlightError = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const lastBoundaryRef = useRef(boundary);

  // SVG coordinate dimensions
  const svgWidth = 840;
  const svgHeight = 170;
  const paddingX = 52;
  const axisY = 90;
  const plotWidth = svgWidth - paddingX * 2;

  // Convert math value to SVG X coordinate
  const valueToX = useCallback(
    (val: number) => {
      const clamped = Math.max(min, Math.min(max, val));
      const ratio = (clamped - min) / (max - min);
      return paddingX + ratio * plotWidth;
    },
    [min, max, plotWidth]
  );

  // Convert client X to nearest snapped integer value within [min, max]
  const xToValue = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return boundary;
      const rect = svgRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const scale = svgWidth / rect.width;
      const svgX = relativeX * scale;

      const rawRatio = (svgX - paddingX) / plotWidth;
      const rawVal = min + rawRatio * (max - min);
      const rounded = Math.round(rawVal);
      return Math.max(min, Math.min(max, rounded));
    },
    [min, max, plotWidth, boundary]
  );

  const isStrict = operator === '<' || operator === '>';
  const pointsRight = operator === '>' || operator === '>=';

  // Handle pointer down on draggable handle or on the axis to jump
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStateChange?.(true);

    const newVal = xToValue(e.clientX);
    if (newVal !== boundary) {
      onBoundaryChange(newVal);
      if (soundEnabled) playSnapSound(true);
    }

    if (svgRef.current) {
      svgRef.current.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newVal = xToValue(e.clientX);
    if (newVal !== lastBoundaryRef.current) {
      lastBoundaryRef.current = newVal;
      onBoundaryChange(newVal);
      if (soundEnabled) playSnapSound(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      onDragStateChange?.(false);
      if (svgRef.current && svgRef.current.hasPointerCapture?.(e.pointerId)) {
        svgRef.current.releasePointerCapture?.(e.pointerId);
      }
    }
  };

  // Keyboard navigation on handle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const span = max - min;
    const defaultStep = span > 50 ? 5 : 1;
    const largeStep = span > 50 ? 20 : 5;

    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      delta = e.shiftKey ? largeStep : defaultStep;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      delta = -(e.shiftKey ? largeStep : defaultStep);
    } else if (e.key === 'PageUp') {
      delta = largeStep;
    } else if (e.key === 'PageDown') {
      delta = -largeStep;
    } else if (e.key === 'Home') {
      onBoundaryChange(min);
      if (soundEnabled) playSnapSound(true);
      e.preventDefault();
      return;
    } else if (e.key === 'End') {
      onBoundaryChange(max);
      if (soundEnabled) playSnapSound(true);
      e.preventDefault();
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      const target = Math.max(min, Math.min(max, boundary + delta));
      if (target !== boundary) {
        onBoundaryChange(target);
        if (soundEnabled) playSnapSound(true);
      }
    }
  };

  useEffect(() => {
    lastBoundaryRef.current = boundary;
  }, [boundary]);

  // Compute ticks adaptively to prevent overcrowding when range is -100 to 100
  const { majorTicks, midTicks, minorTicks } = useMemo(() => {
    const span = max - min;
    let majorStep = 1;
    let midStep = 1;
    let minorStep = 1;

    if (span <= 20) {
      majorStep = 1;
      midStep = 1;
      minorStep = 1;
    } else if (span <= 50) {
      majorStep = 5;
      midStep = 1;
      minorStep = 1;
    } else if (span <= 100) {
      majorStep = 10;
      midStep = 5;
      minorStep = 1;
    } else {
      // span is 200 (range -100 to 100)
      majorStep = 20; // -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100 (11 clean labels)
      midStep = 10;   // ticks at -90, -70, -50...
      minorStep = 5;  // subtle ticks at -95, -85...
    }

    const majors: number[] = [];
    const mids: number[] = [];
    const minors: number[] = [];

    for (let v = min; v <= max; v += (span > 50 ? 5 : 1)) {
      if (v % majorStep === 0) {
        majors.push(v);
      } else if (v % midStep === 0) {
        mids.push(v);
      } else if (v % minorStep === 0) {
        minors.push(v);
      }
    }

    return { majorTicks: majors, midTicks: mids, minorTicks: minors };
  }, [min, max]);

  const boundaryX = valueToX(boundary);
  const minX = valueToX(min);
  const maxX = valueToX(max);

  // Region bounds
  const regionStartX = pointsRight ? boundaryX : minX - 18;
  const regionEndX = pointsRight ? maxX + 18 : boundaryX;
  const regionWidth = Math.max(0, regionEndX - regionStartX);

  // Color theme variables based on state
  const activeColor = highlightCorrect ? '#14B8A6' : highlightError ? '#EF4444' : '#4F46E5';
  const shadeColor = highlightCorrect ? '#0D9488' : '#4F46E5';

  const currentSpan = Math.max(Math.abs(min), Math.abs(max));

  return (
    <div className="w-full relative flex flex-col items-center">
      <div className="w-full relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs p-2 sm:p-4 transition-all duration-300">
        {/* Top bar with drag hint and Range selector buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2 pt-1 pb-2 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" />
              Drag endpoint or tap number line
            </span>
            <span className="font-mono tabular-nums font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              x {operator === '<=' ? '≤' : operator === '>=' ? '≥' : operator} {boundary}
            </span>
          </div>

          {/* Range Limit Selector (-100 to 100 options) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Scale:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onRangeChange?.(10)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                  currentSpan === 10
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Zoom into range -10 to 10"
              >
                ±10
              </button>
              <button
                type="button"
                onClick={() => onRangeChange?.(50)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                  currentSpan === 50
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mid range -50 to 50"
              >
                ±50
              </button>
              <button
                type="button"
                onClick={() => onRangeChange?.(100)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                  currentSpan === 100
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full limit -100 to 100"
              >
                ±100
              </button>
            </div>
          </div>
        </div>

        {/* The Responsive SVG Stage */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none touch-none cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="region"
          aria-label="Interactive Number Line from -100 to 100"
        >
          <defs>
            {/* Arrow marker for right-pointing rays */}
            <marker
              id="ray-arrow-right"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 10 6 L 0 10.5 z" fill={activeColor} />
            </marker>

            {/* Arrow marker for left-pointing rays */}
            <marker
              id="ray-arrow-left"
              markerWidth="12"
              markerHeight="12"
              refX="2"
              refY="6"
              orient="auto"
            >
              <path d="M 10 1.5 L 0 6 L 10 10.5 z" fill={activeColor} />
            </marker>

            {/* Axis Endpoints Markers */}
            <marker
              id="axis-arrow-right"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="#64748B" />
            </marker>
            <marker
              id="axis-arrow-left"
              markerWidth="8"
              markerHeight="8"
              refX="1"
              refY="4"
              orient="auto"
            >
              <path d="M 7 1 L 0 4 L 7 7 z" fill="#64748B" />
            </marker>

            {/* Soft gradient for solution region band */}
            <linearGradient id="solution-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={shadeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={shadeColor} stopOpacity="0.08" />
            </linearGradient>

            {/* Subtle glow filter when hovering/active */}
            <filter id="handle-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={activeColor} floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background grid guide band for solution zone */}
          <rect
            x={regionStartX}
            y={axisY - 26}
            width={regionWidth}
            height={52}
            rx={8}
            fill="url(#solution-gradient)"
            className="transition-all duration-150 pointer-events-none"
          />

          {/* Solution Region Top Ray Bar (bold colored line) */}
          <line
            x1={regionStartX}
            y1={axisY}
            x2={regionEndX}
            y2={axisY}
            stroke={activeColor}
            strokeWidth="7"
            strokeLinecap="round"
            markerEnd={pointsRight ? 'url(#ray-arrow-right)' : undefined}
            markerStart={!pointsRight ? 'url(#ray-arrow-left)' : undefined}
            className="transition-all duration-100 pointer-events-none"
          />

          {/* Main Number Line Axis */}
          <line
            x1={paddingX - 16}
            y1={axisY}
            x2={svgWidth - paddingX + 16}
            y2={axisY}
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
            markerStart="url(#axis-arrow-left)"
            markerEnd="url(#axis-arrow-right)"
            className="pointer-events-none"
          />

          {/* Minor Ticks (subtle small ticks) */}
          {minorTicks.map((val) => {
            const x = valueToX(val);
            return (
              <line
                key={`minor-${val}`}
                x1={x}
                y1={axisY - 4}
                x2={x}
                y2={axisY + 4}
                stroke="#CBD5E1"
                strokeWidth="1"
                className="pointer-events-none"
              />
            );
          })}

          {/* Mid Ticks (medium ticks without labels) */}
          {midTicks.map((val) => {
            const x = valueToX(val);
            return (
              <g
                key={`mid-${val}`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoundaryChange(val);
                  if (soundEnabled) playSnapSound(true);
                }}
              >
                <rect
                  x={x - 8}
                  y={axisY - 20}
                  width="16"
                  height="40"
                  fill="transparent"
                />
                <line
                  x1={x}
                  y1={axisY - 7}
                  x2={x}
                  y2={axisY + 7}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  className="transition-colors group-hover:stroke-indigo-600"
                />
              </g>
            );
          })}

          {/* Major Ticks and Readable Number Labels */}
          {majorTicks.map((val) => {
            const x = valueToX(val);
            const isZero = val === 0;
            const isBoundary = val === boundary;
            const tickHeight = isZero ? 24 : 16;

            return (
              <g
                key={`major-${val}`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoundaryChange(val);
                  if (soundEnabled) playSnapSound(true);
                }}
              >
                {/* Touch/Click Hit Area */}
                <rect
                  x={x - 14}
                  y={axisY - 25}
                  width="28"
                  height="70"
                  fill="transparent"
                />

                {/* Major Tick Mark */}
                <line
                  x1={x}
                  y1={axisY - tickHeight / 2}
                  x2={x}
                  y2={axisY + tickHeight / 2}
                  stroke={isZero ? '#1E293B' : '#64748B'}
                  strokeWidth={isZero ? 3 : 2}
                  strokeLinecap="round"
                  className="transition-colors group-hover:stroke-indigo-600"
                />

                {/* Number Label */}
                <text
                  x={x}
                  y={axisY + 32}
                  textAnchor="middle"
                  fontSize={isZero ? '14' : '12'}
                  fontWeight={isZero || isBoundary ? '700' : '500'}
                  fill={isBoundary ? activeColor : isZero ? '#0F172A' : '#475569'}
                  className="transition-all duration-150 pointer-events-none font-mono tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Optional Test Point Marker (if student is testing a number) */}
          {testPoint !== null && (
            <g
              transform={`translate(${valueToX(testPoint)}, ${axisY})`}
              className="pointer-events-none transition-all duration-200"
            >
              <circle r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#B45309"
                className="font-mono"
              >
                test: {testPoint}
              </text>
            </g>
          )}

          {/* Draggable Boundary Endpoint Handle */}
          <g
            transform={`translate(${boundaryX}, ${axisY})`}
            onPointerDown={handlePointerDown}
            onMouseEnter={() => setIsHoveringHandle(true)}
            onMouseLeave={() => setIsHoveringHandle(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-label="Boundary endpoint"
            aria-valuenow={boundary}
            aria-valuemin={min}
            aria-valuemax={max}
            className="cursor-grab active:cursor-grabbing outline-hidden focus-visible:ring-4 focus-visible:ring-indigo-300 rounded-full"
          >
            {/* Expanded Invisible Grab Area for Touch Devices (r=34) */}
            <circle r="34" fill="transparent" />

            {/* Visual Halo on Drag / Hover */}
            <circle
              r={isDragging ? 26 : isHoveringHandle ? 22 : 18}
              fill={activeColor}
              fillOpacity={isDragging ? 0.22 : 0.12}
              className="transition-all duration-200 pointer-events-none"
            />

            {/* Boundary circle: Strict = Open Circle (Hollow), Inclusive = Filled Circle */}
            {isStrict ? (
              // Open Circle: thick colored stroke, pure white interior
              <circle
                r="11"
                fill="#FFFFFF"
                stroke={activeColor}
                strokeWidth="4"
                filter="url(#handle-glow)"
                className="transition-all duration-150"
              />
            ) : (
              // Filled Circle: solid colored interior with white outer border
              <circle
                r="11"
                fill={activeColor}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                filter="url(#handle-glow)"
                className="transition-all duration-150"
              />
            )}

            {/* Floating Value Pill Pin Above Handle */}
            <g
              transform="translate(0, -38)"
              className="pointer-events-none transition-transform duration-100"
            >
              {/* Badge Background - dynamically sized for 3-digit numbers like -100 or 100 */}
              <rect
                x={Math.abs(boundary) >= 100 ? -32 : -26}
                y="-18"
                width={Math.abs(boundary) >= 100 ? 64 : 52}
                height="26"
                rx="13"
                fill="#1E293B"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />
              {/* Pointy tip */}
              <polygon points="-5,8 5,8 0,13" fill="#1E293B" />
              {/* Value Text */}
              <text
                x="0"
                y="-1"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#FFFFFF"
                className="font-mono tabular-nums"
              >
                {boundary}
              </text>
            </g>
          </g>
        </svg>

        {/* Legend strip below the line for Grade 7 learners */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white" />
              <strong className="text-slate-700 font-semibold">&lt; or &gt;</strong> Open (not included)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white" />
              <strong className="text-slate-700 font-semibold">≤ or ≥</strong> Closed (included)
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Arrow points {pointsRight ? 'Right (+∞)' : 'Left (-∞)'}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono">Limit: [{min}, {max}]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
