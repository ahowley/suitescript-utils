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

function createAndThrowError(name: string, message: string) {
  const err = error.create({ name, message });
  throw err;
}

export const throwError = {
  /**
   * Raise this type of error when a function, object property, or other behavior expects a value of a
   * different type or shape than what was provided to it, i.e. when validating unknown or untyped values.
   *
   * @param invalidValueName - The name of the variable, parameter, property, etc. that was assigned an
   * invalid value.
   * @param invalidValue - The value that was erroneously assigned.
   * @param message - Helpful guidance for a developer attempting to correct this error.
   */
  wrongType: (invalidValueName: string, invalidValue: any, message: string) => {
    const invalidValueString = typeof invalidValue === "string" ? invalidValue : JSON.stringify(invalidValue);
    createAndThrowError(
      "NG_TYPE_ERROR",
      `The value ${invalidValueString} provided to ${invalidValueName} is invalid: ${message}`,
    );
  },
  /**
   * Raise this type of error when code that was written with the understanding that it would be unreachable
   * is reached and executed.
   * @param description - A description of where the code is and anything else that could be helpful for a
   * developer encountering this error.
   */
  shouldBeUnreachable: (description: string) => {
    createAndThrowError(
      "UNREACHABLE_REACHED",
      `Code intended to be unreachable was reached and executed: ${description}`,
    );
  },
};
