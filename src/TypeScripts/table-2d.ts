/**
 * table-2d.ts
 * @NApiVersion 2.1
 *
 * This module contains functionality for basic grouping and summarization around a table-like data structure,
 * built to intuitively interoperate with NetSuite's native data types.
 */

export class Table2d<T> {
  #iteratorIndex: number;
  #columnIndicesCached: Map<string, number>;
  columns: string[];
  rows: T[][];

  constructor(columns: string[], rows: T[][]) {
    this.columns = columns;
    this.rows = rows;
    this.#iteratorIndex = -1;
    this.#columnIndicesCached = new Map();
  }

  getColumnIndexByName(label: string) {
    let index = this.#columnIndicesCached.get(label);

    if (index === undefined) {
      index = this.columns.findIndex(l => l === label);
      if (index === -1) return null;
      this.#columnIndicesCached.set(label, index);
    }

    return index;
  }

  length() {
    return this.rows.length;
  }

  get(row: number, label: string) {
    const col = this.getColumnIndexByName(label);
    if (label === null || col === null) return null;
    return this.rows[row][col];
  }

  join(table: Table2d<T>) {
    return new Table2dJoin(this, table);
  }

  union(table: Table2d<T>) {
    const unionColumns = this.columns.filter(col => table.columns.includes(col));
    if (unionColumns.length === 0) {
      return null;
    }

    const unionRows = [];
    const thisColumnIndices = unionColumns.map(col => this.getColumnIndexByName(col));
    for (const row of this) {
      const filteredRow = row.filter((_, i) => thisColumnIndices.includes(i));
      unionRows.push(filteredRow);
    }

    const otherColumnIndices = unionColumns.map(col => table.getColumnIndexByName(col));
    for (const row of table) {
      const filteredRow = row.filter((_, i) => otherColumnIndices.includes(i));
      unionRows.push(filteredRow);
    }

    return new Table2d(unionColumns, unionRows);
  }

  objects(): Object[] {
    return this.rows.map(row => Object.fromEntries(row.map((val, i) => [this.columns[i], val])));
  }

  summarize(groupColumns: string[], sumColumns: string[], countColumns: string[]) {
    const hashedRows = new Map<string, (T | number)[]>();
    const groupColumnIndices = groupColumns
      .map(col => this.getColumnIndexByName(col))
      .filter(col => col !== null) as number[];
    const columnIndicesToSum = sumColumns
      .map(col => this.getColumnIndexByName(col))
      .filter(col => col !== null) as number[];
    const columnIndicesToCount = countColumns
      .map(col => this.getColumnIndexByName(col))
      .filter(col => col !== null) as number[];

    for (let i = 0; i < this.rows.length; i++) {
      const groupHash = groupColumnIndices.map(col => JSON.stringify(this.rows[i][col!])).join();
      const hashedRow = hashedRows.get(groupHash);

      const currentRow = this.rows[i];
      if (!!hashedRow) {
        for (const sumColumnIndex of columnIndicesToSum) {
          const addToSum = parseFloat((currentRow[sumColumnIndex] as string) ?? "0");
          if (!isNaN(addToSum)) {
            hashedRow[sumColumnIndex] = (hashedRow[sumColumnIndex] as number) + addToSum;
          }
        }
        for (const countColumnIndex of columnIndicesToCount) {
          (hashedRow[countColumnIndex] as number) += 1;
        }
      } else {
        hashedRows.set(
          groupHash,
          currentRow.map((val, i) => {
            if (columnIndicesToSum.includes(i)) {
              const parsedVal = parseFloat((val as string) ?? "0");
              return isNaN(parsedVal) ? 0 : parsedVal;
            }
            return val;
          }),
        );
      }
    }

    const summaryColumns = [...groupColumns, ...sumColumns, ...countColumns];
    const allSummaryIndices = [
      ...groupColumns.map(col => this.getColumnIndexByName(col)),
      ...columnIndicesToSum,
      ...columnIndicesToCount,
    ];

    const summarizedRows: (number | T)[][] = [];
    for (const summaryRow of hashedRows.values()) {
      summarizedRows.push(summaryRow.filter((_, i) => allSummaryIndices.includes(i)));
    }

    return new Table2d(summaryColumns, summarizedRows);
  }

  // Array Methods
  static from<T extends Object>(objects: T[]) {
    const labels = Object.keys(objects[0]);
    const values = objects.map(obj => Object.values(obj));

    return new Table2d(labels, values);
  }

  at(index: number) {
    return this.rows.at(index);
  }

  concat(...values: (T[] | T[][])[]) {
    return new Table2d(this.columns, this.rows.concat(...values));
  }

  entries() {
    return this.rows.entries();
  }

  every(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.every(predicate);
  }

  filter(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return new Table2d(this.columns, this.rows.filter(predicate));
  }

  find(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.find(predicate);
  }

  findIndex(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.findIndex(predicate);
  }

  findLast(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.findLast(predicate);
  }

  findLastIndex(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.findLastIndex(predicate);
  }

  flat() {
    return this.rows.flat();
  }

  flatMap(callback: (value: T[], index: number, array: T[][]) => any) {
    return new Table2d(this.columns, this.rows.flatMap(callback));
  }

  forEach(callback: (value: T[], index: number, array: T[][]) => void) {
    return this.rows.forEach(callback);
  }

  map(callback: (value: T[], index: number, array: T[][]) => any) {
    return new Table2d(this.columns, this.rows.map(callback));
  }

  reduce(callback: (accumulator: any, current: T[], index: number, array: T[][]) => any) {
    return this.rows.reduce(callback);
  }

  reduceRight(callback: (accumulator: any, current: T[], index: number, array: T[][]) => any) {
    return this.rows.reduceRight(callback);
  }

  reverse() {
    this.rows.reverse();
  }

  some(predicate: (value: T[], index: number, array: T[][]) => boolean) {
    return this.rows.some(predicate);
  }

  sort(compareFn: (a: T[], b: T[]) => number) {
    this.rows.sort(compareFn);
  }

  // Iterable/Iterator Implementation
  next(): IteratorResult<T[], null> {
    this.#iteratorIndex += 1;
    if (this.#iteratorIndex < this.rows.length) {
      return {
        value: this.rows[this.#iteratorIndex],
        done: false,
      };
    }

    return {
      value: null,
      done: true,
    };
  }

  [Symbol.iterator]() {
    return this;
  }
}

export class Table2dJoin<T> {
  table1: Table2d<T>;
  table2: Table2d<T>;

  constructor(table1: Table2d<T>, table2: Table2d<T>) {
    this.table1 = table1;
    this.table2 = table2;
  }

  on(table1Column: string, table2Column: string) {
    const joinedColumns = [...this.table1.columns];
    for (const col of this.table2.columns) {
      if (!joinedColumns.includes(col)) {
        joinedColumns.push(col);
      } else {
        joinedColumns.push(`${this.table2} - ${col}`);
      }
    }

    const joinedValues = [];
    for (let i = 0; i < this.table1.length(); i++) {
      const value1 = this.table1.get(i, table1Column);
      for (let j = 0; j < this.table2.length(); j++) {
        const value2 = this.table2.get(j, table2Column);
        if (value1 === value2 && value1 !== null) {
          joinedValues.push([...(this.table1.at(i) ?? []), ...(this.table2.at(i) ?? [])]);
          continue;
        }
      }
    }

    return new Table2d(joinedColumns, joinedValues);
  }
}
