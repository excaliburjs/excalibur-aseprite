import type { Locator, Page } from '@playwright/test';

export interface AsepriteCase {
  /**
   * Directory under the vite root (example/) holding the page. Omitted for the single
   * top-level example page; kept so additional example pages can be added in their own
   * subdirectory without reshaping the spec.
   */
  dir?: string;
  /** HTML file within the directory, defaults to 'index.html' */
  file?: string;
  /** Snapshot name, defaults to `dir` (set explicitly for directories with multiple pages) */
  name?: string;
  /** Optional interaction to run (scripted from the page's own on-page directions) before the screenshot */
  action?: (page: Page, canvas: Locator) => Promise<void>;
  /** If set, the case is skipped with this reason instead of run */
  skip?: string;
  /**
   * Overrides the default maxDiffPixelRatio (see aseprite.spec.ts). Use sparingly - only for
   * scenes where the small residual drift from stepEngineClock's one-real-frame boot window
   * compounds into a materially different frame, not as a general flakiness workaround.
   */
  tolerance?: number;
  /**
   * Overrides the default number of post-action clock-steps (see aseprite.spec.ts) before
   * capturing. Use for pages whose documented visual state only appears after a scripted
   * delay longer than the default ~10 steps (~166ms simulated) covers.
   */
  settleSteps?: number;
}

export const ASEPRITE_CASES: AsepriteCase[] = [
  // example/main.ts: four actors - a named animation from the binary .aseprite, a single
  // sprite off the parsed spritesheet, and the all-frames animation from both the binary
  // and the .json exports.
  { name: 'aseprite-resource' }
];
