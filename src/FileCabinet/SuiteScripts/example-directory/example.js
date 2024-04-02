/**
 * example.ts
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 *
 * Put a basic description of what your script does here.
 *
 * Dependencies:
 * Saved Searches
 * - customsearch_100: SCRIPT USE : Search Name Here
 * Custom Fields
 * - custbody_example: Describe what about this field is expected to stay the same, and how it is used, if necessary.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/ui/message"], function (require, exports, message_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pageInit = void 0;
    message_1 = __importDefault(message_1);
    /**
     * Describe an exported function or endpoint with JSDocs. This should always be included for exported functions in
     * custom modules, and should be included for endpoints when deemed necessary or useful (for example, in a Restlet,
     * explaining how a POST endpoint should be used). Note you don't need to include type information for parameters or
     * return values - TypeScript handles this already.
     */
    const pageInit = (context) => {
        const popup = message_1.default.create({
            title: "Hello, ",
            message: context.currentRecord.getText("name"),
            type: message_1.default.Type.INFORMATION,
        });
        popup.show();
    };
    exports.pageInit = pageInit;
});
