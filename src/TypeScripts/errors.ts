/**
 * errors.ts
 * @NApiVersion 2.1
 * Utility code for handling errors inside SuiteScripts.
 */

import error from "N/error";
import log from "N/log";

/**
 * This is a utility for logging an error without suspending execution.
 *
 * @param logTitle - This will print in NetSuite's logs as the title of this entry.
 * @param err - The error object, usually obtained from a catch block.
 */
export function logAndSuppressError(logTitle: string, err: error.SuiteScriptError | Error | any): boolean {
  let logDetails = "An error has occurred.";

  try {
    const name: string = typeof err?.name === "string" && err.name?.length > 0 ? err.name : "Unknown error";
    logDetails = `${logDetails} #### name: ${name}`;
    const message: string =
      typeof err?.message === "string" && err.message?.length > 0 ? err.message : "An unknown error occurred";
    logDetails = `${logDetails} #### message: ${message}`;
    const cause: string = JSON.stringify(err?.cause ?? "Unknown cause");
    logDetails = `${logDetails} #### cause: ${cause}`;
    const stack: string[] =
      !!err?.stack?.length && typeof err?.stack[0] === "string" && typeof err?.stack !== "string" ? err.stack : [];
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

function createAndThrowError(name: string, message: string): never {
  const err = error.create({ name, message });
  throw err;
}

export const throwError = {
  /**
   * Raise this type of error when a feature or functionality is planned, but not yet implemented.
   * @param featureName - The name of the feature that hasn't yet been implemented.
   */
  notYetImplemented(featureName: string) {
    return createAndThrowError("NG_NOT_IMPLEMENTED", `The feature ${featureName} has not yet been implemented.`);
  },
  /**
   * Raise this type of error when a required or expected parameter, property, etc. is missing.
   *
   * @param missingValueName - The name of the parameter, property, etc. that is missing.
   * @param message - Helpful guidance for a developer attempting to correct this error.
   */
  missingValue: (missingValueName: string, message: string) => {
    return createAndThrowError(
      "NG_MISSING_VALUE",
      `A value was expected to be provided to '${missingValueName}' but is missing: ${message}`,
    );
  },
  /**
   * Raise this type of error when a requested resource is not found in a search, sql query, etc.
   *
   * @param missingResourceName - The name of the resource that is missing.
   * @param message - Helpful guidance for a developer attempting to correct this error.
   */
  notFound: (missingResourceName: string, message: string) => {
    return createAndThrowError(
      "NG_NOT_FOUND",
      `The requested resource '${missingResourceName}' was not found: ${message}`,
    );
  },
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
    return createAndThrowError(
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
    return createAndThrowError(
      "NG_UNREACHABLE_REACHED",
      `Code intended to be unreachable was reached and executed: ${description}`,
    );
  },
  /**
   * Raise this type of error when you find an unexpected duplicate value.
   * @param nameOfDuplicate - the name of the duplicated field, property, etc.
   * @param valueOfDuplicate - the value that was duplicated.
   */
  unexpectedDuplicate: (nameOfDuplicate: string, valueOfDuplicate: string) => {
    return createAndThrowError(
      "NG_UNEXPECTED_DUPLICATE",
      `A value that was supposed to be unique instead appeared at least twice. Name: ${nameOfDuplicate} | Duplicate Value: ${valueOfDuplicate}`,
    );
  },
};
