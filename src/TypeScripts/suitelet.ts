/**
 * suitelet.ts
 * @NApiVersion 2.1
 *
 * This module provides some utilities for working with Suitelets, especially POST parameters.
 */

import { Table2d } from "./table-2d";

const COL_DELIMITER = "\u0001";
const ROW_DELIMITER = "\u0002";

/**
 * Provide a single parameter you'd like parsed as a table - usually, a custom field id. This will convert the string representation
 * into a workable 2d table.
 * @param params - The raw parameter string as received from the Suitelet request object in the entry point context.
 * @param paramSlug - The "slug" of the parameter you'd like parsed. This is typically a field ID as you entered it when creating
 * a custom field.
 */
export function parseListParam(params: { [param: string]: string }, paramSlug: string) {
  const colsParam = `${paramSlug}fields`;
  const rowsParam = `${paramSlug}data`;

  const columns = params[colsParam].split(COL_DELIMITER);
  const rows = params[rowsParam].split(ROW_DELIMITER).map(rowRaw => rowRaw.split(COL_DELIMITER));

  const table = new Table2d<string>(columns, rows);

  return table;
}
