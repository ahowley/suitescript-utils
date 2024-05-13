/**
 * netsuite-ui.ts
 * @NApiVersion 2.1
 *
 * This module contains functionality for building NetSuite user interfaces using N/ui.
 */

import { Type as RecordType } from "N/record";
import serverWidget, {
  AddButtonOptions,
  AddFieldGroupOptions,
  AddPageLinkOptions,
  AddSublistOptions,
  CreateAssistantOptions,
  FieldType,
  Form,
} from "N/ui/serverWidget";
import { throwError } from "./errors";

function validateNsIdSlug(slug: string): string {
  const invalidCharacters = slug.match(/^[a-z_]/);
  if (invalidCharacters[0] !== null) {
    throwError.wrongType(
      "slug",
      slug,
      "A custom form element ID can only consist of lowercase letters and underscores.",
    );
  }

  return slug;
}

export type FieldId = `custpage_fld_${string}`;
/**
 * This function creates an ID for use in custom fields built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export function fieldId(slug: string): FieldId {
  return `custpage_fld_${validateNsIdSlug(slug)}`;
}

export type TabId = `custpage_tab_${string}`;
/**
 * This function creates an ID for use in custom tabs built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export function tabId(slug: string): TabId {
  return `custpage_tab_${validateNsIdSlug(slug)}`;
}

export type FieldGroupId = `custpage_grp_${string}`;
/**
 * This function creates an ID for use in custom field groups built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export function fieldGroupId(slug: string): FieldGroupId {
  return `custpage_grp_${validateNsIdSlug(slug)}`;
}

export type SublistId = `custpage_lst_${string}`;
/**
 * This function creates an ID for use in custom sublists built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export function sublistId(slug: string): SublistId {
  return `custpage_lst_${validateNsIdSlug(slug)}`;
}

/**
 * This function creates an ID for use in custom buttons built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export type ButtonId = `custpage_but_${string}`;
export function buttonId(slug: string): ButtonId {
  return `custpage_but_${validateNsIdSlug(slug)}`;
}

/**
 * This function creates an ID for use in custom page links built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export type PageLinkId = `custpage_lnk_${string}`;
export function pageLinkId(slug: string): PageLinkId {
  return `custpage_lnk_${validateNsIdSlug(slug)}`;
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
  source: string;
};
type CustomSelectFieldOptions = UniversalFieldOptions & {
  type: FieldType.SELECT | FieldType.MULTISELECT;
};

type FieldOptions =
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
  select: (id: FieldId, label: string, recordType: RecordType | string, multiselect: boolean): SelectFieldOptions => {
    return {
      id,
      label,
      type: multiselect ? (FieldType.MULTISELECT as FieldType.MULTISELECT) : (FieldType.SELECT as FieldType.SELECT),
      source: recordType as string,
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

type NgAddFieldGroupOptions = Omit<AddFieldGroupOptions, "id"> & { id: FieldGroupId };
type NgAddTabOptions = Omit<AddFieldGroupOptions, "id"> & { id: TabId };
type NgAddSublistOptions = Omit<AddSublistOptions, "id"> & { id: SublistId };
type NgAddButtonOptions = Omit<AddButtonOptions, "id"> & { id: ButtonId };
type NgAddPageLinkOptions = Omit<AddPageLinkOptions, "id"> & { id: PageLinkId };

export type PageElements = {
  /** An array (in order of appearance) of field options for adding fields to the body of the form. */
  bodyFields?: FieldOptions[];
  /** An array (in order of appearance) of field group options for adding field groups to the body of the form. */
  fieldGroups?: NgAddFieldGroupOptions[];
  /** An array (in order of appearance) of tabs to add to the body of the form. */
  tabs?: NgAddTabOptions[];
  /** An array (in order of appearance) of sublists to add to a form. */
  sublists?: { sublist: NgAddSublistOptions; fields: FieldOptions[]; buttons?: NgAddButtonOptions[] }[];
  /** An array (in order of appearance) of custom page links to add to a form. */
  pageLinks?: NgAddPageLinkOptions[];
  /** Optionally attach a client script, along with buttons that trigger custom functions there, to this form. */
  clientScript?: {
    path: string;
    buttons?: NgAddButtonOptions[];
  };
};
export function createPage(
  options: CreateAssistantOptions,
  { bodyFields, fieldGroups, tabs, sublists, pageLinks, clientScript }: PageElements,
): Form {
  const form = serverWidget.createForm(options);
  pageLinks?.forEach(linkOptions => form.addPageLink(linkOptions));
  tabs?.forEach(tabOptions => form.addTab(tabOptions));
  fieldGroups?.forEach(groupOptions => form.addFieldGroup(groupOptions));
  bodyFields?.forEach(fieldOptions => form.addField(fieldOptions));

  if (!!clientScript) {
    form.clientScriptModulePath = clientScript.path;
    clientScript.buttons?.forEach(buttonOptions => form.addButton(buttonOptions));
  }

  if (!!sublists) {
    for (const { sublist: sublistOptions, fields, buttons } of sublists) {
      const sublist = form.addSublist(sublistOptions);
      fields.forEach(fieldOptions => sublist.addField(fieldOptions));
      buttons?.forEach(buttonOptions => sublist.addButton(buttonOptions));
    }
  }

  return form;
}
