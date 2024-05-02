/**
 * errors.ts
 * @NApiVersion 2.1
 * Utility code for handling errors inside SuiteScripts.
 */

import log from "N/log";
import error from "N/error";

export function logAndSuppressError(logTitle: string, err: error.SuiteScriptError | Error | any): boolean {
  let logDetails = "An error has occurred.";

  try {
    const name: string = typeof err?.name === "string" ? err.string : "Unknown error";
    logDetails = `${logDetails} #### name: ${name}`;
    const message: string = typeof err?.message === "string" ? err.message : "An unknown error occurred";
    logDetails = `${logDetails} #### message: ${message}`;
    const cause: string = JSON.stringify(err?.cause ?? "Unknown cause");
    logDetails = `${logDetails} #### cause: ${cause}`;
    const stack: string[] = !!err?.stack?.length && typeof err.stack[0] === "string" ? err.stack : [];
    logDetails = `${logDetails} #### stack: ${stack.join(" | ")}`;

    log.error(logTitle, logDetails);
    return true;
  } catch (handleError: any) {
    log.error(
      logTitle,
      `An error occurred while handling a different error.
		#### error: ${JSON.stringify(handleError)}
		#### original error: #${JSON.stringify(err)}`,
    );
  }

  return false;
}
