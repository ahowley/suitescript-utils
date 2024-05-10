/**
 * netsuite-ui.ts
 * @NApiVersion 2.1
 *
 * This module contains functionality for building NetSuite user interfaces using N/ui.
 */

import record, { Field, Type as RecordType } from "N/record";
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
type HtmlFieldOptions = UniversalFieldOptions & {
  type: FieldType.INLINEHTML;
};
type EmailFieldOptions = UniversalFieldOptions & {
  type: FieldType.EMAIL;
};
type PasswordFieldOptions = UniversalFieldOptions & {
  type: FieldType.PASSWORD;
};
type PhoneFieldOptions = UniversalFieldOptions & {
  type: FieldType.PHONE;
};
type IntegerFieldOptions = UniversalFieldOptions & {
  type: FieldType.INTEGER | FieldType.PERCENT;
};
type DecimalFieldOptions = UniversalFieldOptions & {
  type: FieldType.FLOAT | FieldType.CURRENCY;
};
type DateFieldOptions = UniversalFieldOptions & {
  type: FieldType.DATE | FieldType.DATETIMETZ;
};
type SelectFieldOptions = UniversalFieldOptions & {
  type: FieldType.SELECT | FieldType.MULTISELECT;
  source: RecordType;
};
type CustomSelectFieldOptions = UniversalFieldOptions & {
  type: FieldType.SELECT | FieldType.MULTISELECT;
};

type FieldOptions =
  | UniversalFieldOptions
  | TextFieldOptions
  | HtmlFieldOptions
  | EmailFieldOptions
  | PasswordFieldOptions
  | PhoneFieldOptions
  | IntegerFieldOptions
  | DecimalFieldOptions
  | DateFieldOptions
  | SelectFieldOptions
  | CustomSelectFieldOptions;
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
  html: (id: FieldId, label: string): HtmlFieldOptions => {
    return {
      id,
      label,
      type: FieldType.INLINEHTML as FieldType.INLINEHTML,
    };
  },
  email: (id: FieldId, label: string): EmailFieldOptions => {
    return {
      id,
      label,
      type: FieldType.EMAIL as FieldType.EMAIL,
    };
  },
  password: (id: FieldId, label: string): PasswordFieldOptions => {
    return {
      id,
      label,
      type: FieldType.PASSWORD as FieldType.PASSWORD,
    };
  },
  phone: (id: FieldId, label: string): PhoneFieldOptions => {
    return {
      id,
      label,
      type: FieldType.PHONE as FieldType.PHONE,
    };
  },
  /**
   * @param isPercent - Treat this integer as a percentage between 0 and 100.
   */
  int: (id: FieldId, label: string, isPercent: boolean): IntegerFieldOptions => {
    return {
      id,
      label,
      type: isPercent ? (FieldType.PERCENT as FieldType.PERCENT) : (FieldType.INTEGER as FieldType.INTEGER),
    };
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
  /**
   * @param dateOnly - Whether to exclude the time component from this field, only storing the date.
   */
  date: (id: FieldId, label: string, dateOnly: boolean): DateFieldOptions => {
    return {
      id,
      label,
      type: dateOnly ? (FieldType.DATE as FieldType.DATE) : (FieldType.DATETIMETZ as FieldType.DATETIMETZ),
    };
  },
  /**
   * @param recordType - the type of record to select from in this select field. For a custom select field,
   * use field.customSelect() instead.
   * @param multiselect - whether to allow multiple selections from the options at once.
   */
  select: (id: FieldId, label: string, recordType: RecordType, multiselect: boolean): SelectFieldOptions => {
    return {
      id,
      label,
      type: multiselect ? (FieldType.MULTISELECT as FieldType.MULTISELECT) : (FieldType.SELECT as FieldType.SELECT),
      source: recordType,
    };
  },
  /**
   * Create options for a select field with custom entries to select from. Note: options must be added with
   * Field.addSelectOption(options)
   *
   * @param multiselect - whether to allow multiple selections from the options at once.
   */
  customSelect: (id: FieldId, label: string, multiselect: boolean): CustomSelectFieldOptions => {
    return {
      id,
      label,
      type: multiselect ? (FieldType.MULTISELECT as FieldType.MULTISELECT) : (FieldType.SELECT as FieldType.SELECT),
    };
  },
};
