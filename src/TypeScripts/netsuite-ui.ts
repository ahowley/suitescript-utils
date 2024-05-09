/**
 * netsuite-ui.ts
 * @NApiVersion 2.1
 *
 * This module contains functionality for building NetSuite user interfaces using N/ui.
 */

import record from "N/record";
import serverWidget, { FieldType } from "N/ui/serverWidget";
import { throwError } from "./errors";

type FieldId = `custpage_${string}`;
type TabId = `custpage_tab_${string}`;

/**
 * This function creates an ID for use in custom fields built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
function fieldId(slug: string): FieldId {
  const invalidCharacters = slug.match(/^[a-z_]/);
  if (invalidCharacters[0] !== null) {
    throwError.wrongType(
      "slug",
      slug,
      "A custom form element ID can only consist of lowercase letters and underscores.",
    );
  }
  return `custpage_${slug}`;
}

type UniversalFieldOptions = {
  id: FieldId;
  label: string;
};
type TextFieldOptions = UniversalFieldOptions & {
  type: FieldType.TEXT | FieldType.TEXTAREA | FieldType.LONGTEXT;
};
type IntegerFieldOptions = UniversalFieldOptions & {
  type: FieldType.INTEGER;
};
type DecimalFieldOptions = UniversalFieldOptions & {
  type: FieldType.FLOAT | FieldType.CURRENCY;
};

type FieldOptions = UniversalFieldOptions | TextFieldOptions | IntegerFieldOptions | DecimalFieldOptions;
/**
 * Generate  field properties for a field that will go in a custom form, sublist, tab, or field group.
 *
 * @param id - A new, unique ID for this field, generated with the fieldId function.
 * @param label - The human-readable field name that will appear in the UI.
 */
type FieldFunction = (id: FieldId, label: string, ...options: any) => FieldOptions;

/**
 * Generate field properties for a field that will go in a custom form, sublist, tab, or field group.
 */
export const field: { [fieldType: string]: FieldFunction } = {
  /**
   * @param characterLimit - Either 300, 4,000, or 100,000, which are the character limits for NetSuite's
   * Free-Form Text, Text Area, and Long Text field types, respectively.
   */
  text: (id: FieldId, label: string, characterLimit: 300 | 4_000 | 100_000): TextFieldOptions => {
    const fieldType = (): FieldType.TEXT | FieldType.TEXTAREA | FieldType.LONGTEXT => {
      switch (characterLimit) {
        case 300:
          return FieldType.TEXT;
        case 4_000:
          return FieldType.TEXTAREA;
        case 100_000:
          return FieldType.LONGTEXT;
      }
    };

    return { id, label, type: fieldType() };
  },
  /**
   * @param label - The human-readable field name that will appear in the UI.
   */
  int: (id: FieldId, label: string): IntegerFieldOptions => {
    return { id, label, type: FieldType.INTEGER as FieldType.INTEGER };
  },
  /**
   * @param isCurrency - Whether the numbers in this field should be considered currency.
   */
  decimal: (id: FieldId, label: string, isCurrency: boolean): DecimalFieldOptions => {
    return {
      id,
      label,
      type: isCurrency ? (FieldType.CURRENCY as FieldType.CURRENCY) : (FieldType.FLOAT as FieldType.FLOAT),
    };
  },
};
