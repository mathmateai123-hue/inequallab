/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/inequality';

export const GRADE_7_QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'Represent the inequality: x > 3',
    description: 'Find all numbers greater than 3.',
    target: {
      variable: 'x',
      operator: '>',
      boundary: 3,
    },
    hint: 'Strict inequality (>) means 3 itself is not a solution, so use an open circle pointing to the right.',
    conceptNote: 'The open circle at 3 shows that 3 is excluded. The shaded line extends right towards positive infinity.',
  },
  {
    id: 'q2',
    title: 'Represent the inequality: x ≤ 0',
    description: 'Find all numbers less than or equal to 0.',
    target: {
      variable: 'x',
      operator: '<=',
      boundary: 0,
    },
    hint: 'Inclusive inequality (≤) includes 0 itself, so use a filled circle pointing left toward negative numbers.',
    conceptNote: 'The filled circle at 0 means 0 is included. The shaded arrow to the left includes all negative numbers.',
  },
  {
    id: 'q3',
    title: 'Represent the inequality: x < -2',
    description: 'Find all numbers strictly less than -2.',
    target: {
      variable: 'x',
      operator: '<',
      boundary: -2,
    },
    hint: 'Remember that on a number line, "less than" always moves to the left.',
    conceptNote: 'Strict less than (<) requires an open circle at -2, shading indefinitely to the left.',
  },
  {
    id: 'q4',
    title: 'Represent the inequality: x ≥ 3',
    description: 'Find all numbers greater than or equal to 3.',
    target: {
      variable: 'x',
      operator: '>=',
      boundary: 3,
    },
    hint: 'Notice the line under the inequality sign (≥). This means the boundary is included!',
    conceptNote: 'The solid filled circle means 3 is a valid solution (since 3 ≥ 3 is true).',
  },
  {
    id: 'q5',
    title: 'Represent the inequality: x ≥ -5',
    description: 'Find all numbers greater than or equal to -5.',
    target: {
      variable: 'x',
      operator: '>=',
      boundary: -5,
    },
    hint: 'Numbers greater than -5 lie to the right of -5 (such as -4, 0, and 2).',
    conceptNote: 'Greater than or equal to (≥) uses a filled circle and extends to the right.',
  },
  {
    id: 'q6',
    title: 'Represent the inequality: x < 6',
    description: 'Find all numbers strictly less than 6.',
    target: {
      variable: 'x',
      operator: '<',
      boundary: 6,
    },
    hint: 'Is 6 included in x < 6? No, so keep the circle hollow.',
    conceptNote: 'Strict inequalities (<) never include the endpoint, so an open circle is used.',
  },
  {
    id: 'q7',
    title: 'Represent the inequality: x ≤ -3',
    description: 'Find all numbers less than or equal to -3.',
    target: {
      variable: 'x',
      operator: '<=',
      boundary: -3,
    },
    hint: 'Less than or equal to means a solid point at -3, pointing to more negative numbers on the left.',
    conceptNote: 'Values like -4, -5, -10 are all solutions because they are to the left of -3.',
  },
  {
    id: 'q8',
    title: 'Represent the inequality: x > -1',
    description: 'Find all numbers strictly greater than -1.',
    target: {
      variable: 'x',
      operator: '>',
      boundary: -1,
    },
    hint: 'Values greater than -1 include 0, 1, 2, and so forth.',
    conceptNote: 'Open circle at -1 with shading moving rightward to positive values.',
  },
  {
    id: 'q9',
    title: 'Represent the inequality: x ≥ 40',
    description: 'Find all numbers greater than or equal to 40 (Extended Range).',
    target: {
      variable: 'x',
      operator: '>=',
      boundary: 40,
    },
    hint: 'Use the ±100 range scale to reach 40. Greater than or equal to uses a filled circle pointing right.',
    conceptNote: 'Filled circle at 40 with solution region shading to the right towards 100 and +∞.',
  },
  {
    id: 'q10',
    title: 'Represent the inequality: x < -60',
    description: 'Find all numbers strictly less than -60.',
    target: {
      variable: 'x',
      operator: '<',
      boundary: -60,
    },
    hint: 'Strict inequality with an open circle at -60, pointing left towards -100.',
    conceptNote: 'Open circle at -60; shading extends indefinitely to the left.',
  },
  {
    id: 'q11',
    title: 'Represent the inequality: x ≤ 75',
    description: 'Find all numbers less than or equal to 75.',
    target: {
      variable: 'x',
      operator: '<=',
      boundary: 75,
    },
    hint: 'Inclusive inequality: filled circle at 75, shaded to the left.',
    conceptNote: 'Filled circle at 75 shows 75 is included, shaded toward smaller values on the left.',
  },
  {
    id: 'q12',
    title: 'Represent the inequality: x > -80',
    description: 'Find all numbers strictly greater than -80.',
    target: {
      variable: 'x',
      operator: '>',
      boundary: -80,
    },
    hint: 'Open circle at -80, pointing right towards 0 and positive numbers.',
    conceptNote: 'Strict greater than (>): open circle at -80 with ray extending rightward.',
  },
];
