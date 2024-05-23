/**
 * sql.ts
 * @NApiVersion 2.1
 * A collection of common functionality relating to SuiteQL queries and/or running NetSuite searches.
 */

import { Column, ResultSet, runSuiteQL, runSuiteQLPaged } from "N/query";
import { throwError } from "./errors";
import { Table2d } from "./table-2d";

type SqlResults = ResultSet[];
type SqlResultValue = string | number | boolean | null;

/**
 * Run any arbitrary SuiteQL query and return the results in an array of ResultSets.
 * @param query - The SuiteQL query to run.
 * @param limit - The allowed number of results. By default,
 */
export function sql(
  query: string,
  params: (string | number | boolean)[] = [],
  limit: 5000 | typeof Infinity = 5000,
): SqlResults {
  if (limit === 5000) {
    return [runSuiteQL({ query, params })];
  }

  const pages = runSuiteQLPaged({ query, params, pageSize: 1000 });
  const resultsSets: SqlResults = [];
  pages.iterator().each(page => {
    resultsSets.push(page.value.data);
    return true;
  });
  return resultsSets;
}

/**
 * Get a map of column field IDs to their respective NetSuite column objects.
 *
 * @param results
 *
 * @throws UNEXPECTED_DUPLICATE - All field IDs are expected to be unique.
 */
export function getColumns(results: SqlResults): Map<string, Column> {
  const columnMap = new Map<string, Column>();
  if (!(results.length > 0)) {
    return columnMap;
  }

  results[0].columns?.forEach(col => {
    const columnId = col.fieldId;
    if (columnMap.has(columnId)) {
      throwError.unexpectedDuplicate("SQL Query Result Column ID", columnId);
    }

    columnMap.set(columnId, col);
  });

  return columnMap;
}

/**
 * Convert a set of SqlResults into a Table2d for more easily working with the resulting data.
 *
 * @param results
 * @param renameColumns - an optional map of columns you'd like to manually rename something other than their
 * field IDs.
 */
export function resultsAsTable(results: SqlResults, renameColumns?: Map<string, string>): Table2d<SqlResultValue> {
  const columns = getColumns(results);
  const columnIds = [...columns.entries()].map(([columnId, _]) => renameColumns?.get(columnId) ?? columnId);

  const values = results.flatMap(set => {
    const results = set.results;
    return results.map(result => result.values);
  });

  return new Table2d(columnIds, values);
}
