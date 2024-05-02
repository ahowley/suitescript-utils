/**
 * errors.ts
 * @NApiVersion 2.1
 * Utility code for handling errors inside SuiteScripts.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logAndSuppressError = void 0;
    log_1 = __importDefault(log_1);
    function logAndSuppressError(logTitle, err) {
        let logDetails = "An error has occurred.";
        try {
            const name = typeof err?.name === "string" ? err.string : "Unknown error";
            logDetails = `${logDetails} #### name: ${name}`;
            const message = typeof err?.message === "string" ? err.message : "An unknown error occurred";
            logDetails = `${logDetails} #### message: ${message}`;
            const cause = JSON.stringify(err?.cause ?? "Unknown cause");
            logDetails = `${logDetails} #### cause: ${cause}`;
            const stack = !!err?.stack?.length && typeof err.stack[0] === "string" ? err.stack : [];
            logDetails = `${logDetails} #### stack: ${stack.join(" | ")}`;
            log_1.default.error(logTitle, logDetails);
            return true;
        }
        catch (handleError) {
            log_1.default.error(logTitle, `An error occurred while handling a different error.
		#### error: ${JSON.stringify(handleError)}
		#### original error: #${JSON.stringify(err)}`);
        }
        return false;
    }
    exports.logAndSuppressError = logAndSuppressError;
});
