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

import { EntryPoints } from "N/types";
import message from "N/ui/message";

/**
 * Describe an exported function or endpoint with JSDocs. This should always be included for exported functions in
 * custom modules, and should be included for endpoints when deemed necessary or useful (for example, in a Restlet,
 * explaining how a POST endpoint should be used). Note you don't need to include type information for parameters or
 * return values - TypeScript handles this already.
 */
export const pageInit: EntryPoints.Client.pageInit = (context: EntryPoints.Client.pageInitContext) => {
  const popup = message.create({
    title: "Hello, ",
    message: context.currentRecord.getText("name") as string,
    type: message.Type.INFORMATION,
  });
  popup.show();
};
