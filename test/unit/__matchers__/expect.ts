// port of excalibur-jasmine for jest. might be a good idea to publish this as its own package.
import type * as ex from 'excalibur';
import { expect } from 'vitest';

expect.extend({
  // users will get a type error as we only type this in spec/visual files
  // but incase they run the test anyway, we'll throw a helpful error
  toEqualImage: () => {
    throw new Error('toEqualImage assertion can only be used in visual tests, please add "@visual" to the test name.');
  },

  toBeVector: (actual: ex.Vector, expected: ex.Vector, delta: number = 0.01) => {
    const distance = actual.distance(expected);
    if (distance <= delta) {
      return {
        pass: true,
        message: () => `Vector within delta ${distance} <= ${delta}`
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected ex.Vector${actual.toString()} to be within ${delta} of ex.Vector${expected.toString()}, but was ${distance} distance apart`
      };
    }
  },
});
