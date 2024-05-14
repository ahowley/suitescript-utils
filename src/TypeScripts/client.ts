/**
 * client.ts
 * @NApiVersion 2.1
 * A collection of common operations performed in client scripts.
 */

import { ClientCurrentRecord } from "N/record";

/**
 * Set whether a NetSuite field on the current record should be required or not.
 *
 * @param loadedRecord - the current record, gotten from a Client Script entry point's "context" object.
 * @param fieldId - the script ID of the field to adjust.
 * @param isRequired - whether this field should be treated as mandatory by NetSuite.
 */
export function required(loadedRecord: ClientCurrentRecord, fieldId: string, isRequired: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isMandatory = isRequired;
}

/**
 * Set whether a NetSuite sublist field/column on the current record should be required or not.
 *
 * @param loadedRecord - the current record, gotten from a Client Script entry point's "context" object.
 * @param sublistId - the sublist whose column we're adjusting.
 * @param fieldId - the script ID of the field to adjust.
 * @param isRequired - whether this field should be treated as mandatory by NetSuite.
 */
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

/**
 * Set whether a NetSuite field on the current record should be disabled or not.
 *
 * @param loadedRecord - the current record, gotten from a Client Script entry point's "context" object.
 * @param fieldId - the script ID of the field to adjust.
 * @param isDisabled - whether this field should be treated as un-editable by NetSuite.
 */
export function disabled(loadedRecord: ClientCurrentRecord, fieldId: string, isDisabled: boolean) {
  const field = loadedRecord.getField({ fieldId });
  field.isDisabled = isDisabled;
}

/**
 * Set whether a NetSuite sublist field on the current record should be disabled or not.
 *
 * @param loadedRecord - the current record, gotten from a Client Script entry point's "context" object.
 * @param sublistId - the sublist whose column we're adjusting.
 * @param fieldId - the script ID of the field to adjust.
 * @param isDisabled - whether this field should be treated as un-editable by NetSuite.
 */
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
