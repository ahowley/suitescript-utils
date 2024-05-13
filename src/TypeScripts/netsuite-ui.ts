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
  Assistant,
  FieldType,
  Form,
  Sublist,
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

export type AssistantStepId = `custpage_stp_${string}`;
/**
 * This function creates an ID for use in custom assistant steps built via N/ui.
 *
 * @param slug - a unique identifier for this form element, consisting exclusively of lowercase
 * letters and underscores.
 */
export function assistantStepId(slug: string): AssistantStepId {
  return `custpage_stp_${validateNsIdSlug(slug)}`;
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
 * Generate field properties for a field that will go in a custom form, sublist, tab, or field group.
 */
export const field = {
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

type NgAddTabOptions = Omit<AddFieldGroupOptions, "id"> & { id: TabId };
type NgAddFieldGroupOptions = Omit<AddFieldGroupOptions, "id"> & { id: FieldGroupId };
type NgAddStepOptions = Omit<AddFieldGroupOptions, "id"> & { id: AssistantStepId };
type NgAddSublistOptions = Omit<AddSublistOptions, "id"> & { id: SublistId };
type NgAddButtonOptions = Omit<AddButtonOptions, "id"> & { id: ButtonId };
type NgAddPageLinkOptions = Omit<AddPageLinkOptions, "id"> & { id: PageLinkId };

type ContainerWithFieldOptions = { fields: FieldOptions[]; requiredFieldIds: FieldId[] };
type TabWithFieldsOptions = ContainerWithFieldOptions & { tab: NgAddTabOptions };
type FieldGroupWithFieldsOptions = ContainerWithFieldOptions & { group: NgAddFieldGroupOptions };
type AssistantStepWithFieldsOptions = ContainerWithFieldOptions & { step: NgAddStepOptions };
type SublistWithFieldsOptions = ContainerWithFieldOptions & {
  sublist: NgAddSublistOptions;
  buttons?: NgAddButtonOptions[];
};

function addFieldsToContainer(
  container: Form | Assistant | Sublist,
  fields: FieldOptions[],
  requiredFieldIds: FieldId[],
  subcontainerId?: TabId | FieldGroupId | AssistantStepId,
) {
  fields.forEach(field => {
    const fieldOptions = !!subcontainerId ? { container: subcontainerId, ...field } : field;
    const added = container.addField(fieldOptions);
    if (requiredFieldIds.includes(added.id as FieldId)) {
      added.isMandatory = true;
    }
  });
}

function createContainerWithFields(container: Form, { tab, fields, requiredFieldIds }: TabWithFieldsOptions): void;
function createContainerWithFields(
  container: Form,
  { group, fields, requiredFieldIds }: FieldGroupWithFieldsOptions,
): void;
function createContainerWithFields(
  container: Assistant,
  { step, fields, requiredFieldIds }: AssistantStepWithFieldsOptions,
): void;
function createContainerWithFields(
  container: Assistant | Form,
  { sublist, fields, requiredFieldIds, buttons }: SublistWithFieldsOptions,
): void;
function createContainerWithFields(
  page: Assistant | Form,
  {
    tab,
    group,
    step,
    sublist,
    fields,
    requiredFieldIds,
    buttons,
  }: ContainerWithFieldOptions & {
    tab?: NgAddTabOptions;
    group?: NgAddFieldGroupOptions;
    step?: NgAddStepOptions;
    sublist?: NgAddSublistOptions;
    buttons?: NgAddButtonOptions[];
  },
) {
  let container: Assistant | Form | Sublist = page;
  let subcontainer: TabId | FieldGroupId | AssistantStepId | undefined;
  if (!!tab) {
    (page as Form).addTab(tab);
    subcontainer = tab.id;
  } else if (!!group) {
    (page as Form).addFieldGroup(group);
    subcontainer = group.id;
  } else if (!!step) {
    (page as Assistant).addStep(step);
    subcontainer = step.id;
  } else if (!!sublist) {
    container = page.addSublist(sublist);
    buttons.forEach(button => (container as Sublist).addButton(button));
  } else {
    throwError.shouldBeUnreachable(
      "createContainerWithFields was supposed to get at least one of a tab, group, step, or sublist.",
    );
  }

  addFieldsToContainer(container, fields, requiredFieldIds, subcontainer);
}

export type PageElements = {
  tabs?: TabWithFieldsOptions[];
  fieldGroups?: FieldGroupWithFieldsOptions[];
  sublists?: SublistWithFieldsOptions[];
  fields?: FieldOptions[];
  requiredFieldIds?: FieldId[];
  pageLinks?: NgAddPageLinkOptions[];
  clientScript?: {
    path: string;
    buttons?: NgAddButtonOptions[];
  };
};
export function createPage(
  title: string,
  { tabs, fieldGroups, sublists, fields, requiredFieldIds, pageLinks, clientScript }: PageElements,
): Form {
  const form = serverWidget.createForm({ title });
  pageLinks?.forEach(link => form.addPageLink(link));
  if (!!clientScript) {
    form.clientScriptModulePath = clientScript.path;
    clientScript.buttons?.forEach(buttonOptions => form.addButton(buttonOptions));
  }

  tabs?.forEach(tab => createContainerWithFields(form, tab));
  fieldGroups?.forEach(group => createContainerWithFields(form, group));
  sublists?.forEach(sublist => createContainerWithFields(form, sublist));
  addFieldsToContainer(form, fields, requiredFieldIds);

  return form;
}

export type AssistantPageElements = {
  steps: AssistantStepWithFieldsOptions[];
  sublists?: SublistWithFieldsOptions[];
  fields?: FieldOptions[];
  requiredFieldIds?: FieldId[];
  clientScriptPath?: string;
};
export function createAssistantPage(
  title: string,
  { steps, sublists, fields, requiredFieldIds, clientScriptPath }: AssistantPageElements,
): Assistant {
  const assistant = serverWidget.createAssistant({ title });
  if (!!clientScriptPath) {
    assistant.clientScriptModulePath = clientScriptPath;
  }

  steps.forEach(step => createContainerWithFields(assistant, step));
  sublists?.forEach(sublist => createContainerWithFields(assistant, sublist));
  addFieldsToContainer(assistant, fields, requiredFieldIds);

  return assistant;
}
