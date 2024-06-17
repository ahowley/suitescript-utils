/** logging.ts
 * @NApiVersion 2.1
 *
 * This module contains some "decorator"-style functions for logging execution in a SuiteScript.
 */

import log from "N/log";
import { remainingUsage } from "./environment";

/**
 * Wrap a function definition with this decorator to log its execution when the script it's called from is deployed
 * in "debug" mode.
 *
 * @param func - The function being defined.
 * @param logTitlePrefix - Add this to show a message before the auto-generated log title.
 */
export function debugLog<Func extends (...args: any[]) => any>(
  func: Func,
  logTitlePrefix?: string,
): (...args: Parameters<Func>) => ReturnType<Func> {
  return (...args: Parameters<Func>) => {
    log.debug(
      `${logTitlePrefix ? logTitlePrefix + " - " : ""}${func.name} invoked`,
      `Calling function ${func.name}. Remaining usage: ${remainingUsage()} | args: ${JSON.stringify(args)}`,
    );
    const result: ReturnType<Func> = func(...args);
    log.debug(
      `${logTitlePrefix ? logTitlePrefix + " - " : ""}${func.name} returned`,
      `Returning result from ${func.name}: ${result}. Remaining usage: ${remainingUsage()}`,
    );

    return result;
  };
}
