// this adds assertions only to be used for visual tests
import type { Visual } from './image-helpers';
import { compareImageData } from './image-helpers';
import { expect } from 'vitest';

expect.extend({
  toEqualImage: async (actual, expected, tolerance = 0.995) => { //async (actual: Visual, expected: Visual, tolerance: number = 0.995) => {
    return await compareImageData(actual, expected, tolerance);
  }
});

declare module 'vitest' {
  interface Matchers<R, T> {
    toEqualImage(expected: Visual, tolerance?: number): Promise<R>
  }
}
