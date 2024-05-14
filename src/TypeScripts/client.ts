/**
 * client.ts
 * @NApiVersion 2.1
 * A collection of common operations performed in client scripts.
 */

import { ClientCurrentRecord } from "@hitc/netsuite-types/N/record";

export function required(loadedRecord: ClientCurrentRecord, fieldId: string, isRequired: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isMandatory = isRequired;
}

export function columnRequired(
  loadedRecord: ClientCurrentRecord,
  sublistId: string,
  fieldId: string,
  isRequired: boolean,
) {
  const sublist = loadedRecord.getSublist({ sublistId });
  const column = sublist.getColumn({ fieldId });
  column.isMandatory = isRequired;
}

export function disabled(loadedRecord: ClientCurrentRecord, fieldId: string, isDisabled: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isDisabled = isDisabled;
}

export function columnDisabled(
  loadedRecord: ClientCurrentRecord,
  sublistId: string,
  fieldId: string,
  isDisabled: boolean,
) {
  const sublist = loadedRecord.getSublist({ sublistId });
  const column = sublist.getColumn({ fieldId });
  column.isDisabled = isDisabled;
}
