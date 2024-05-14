/**
 * client.ts
 * @NApiVersion 2.1
 * A collection of common operations performed in client scripts.
 */

import { Record } from "@hitc/netsuite-types/N/record";

export function required(loadedRecord: Record, fieldId: string, isRequired: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isMandatory = isRequired;
}

export function columnRequired(loadedRecord: Record, sublistId: string, fieldId: string, isRequired: boolean) {
  const sublist = loadedRecord.getSublist({ sublistId });
  const column = sublist.getColumn({ fieldId });
  column.isMandatory = isRequired;
}

export function disabled(loadedRecord: Record, fieldId: string, isDisabled: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isDisabled = isDisabled;
}

export function columnDisabled(loadedRecord: Record, sublistId: string, fieldId: string, isDisabled: boolean) {
  const sublist = loadedRecord.getSublist({ sublistId });
  const column = sublist.getColumn({ fieldId });
  column.isDisabled = isDisabled;
}
