/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InequalityOperator = '<' | '<=' | '>' | '>=';

export interface Inequality {
  variable: string;
  operator: InequalityOperator;
  boundary: number;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  target: Inequality;
  hint: string;
  conceptNote: string;
}

export type FeedbackType = 'default' | 'dragging' | 'correct' | 'incorrect';

export interface ValidationFeedback {
  type: FeedbackType;
  message: string;
  detail?: string;
  isCorrect?: boolean;
  directionWrong?: boolean;
  inclusionWrong?: boolean;
  boundaryWrong?: boolean;
}
