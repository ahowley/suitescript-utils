/**
 * common.ts
 * @NApiVersion 2.1
 * A collection of common types, basic utility functions, etc. used across SDF account customization projects.
 */

import { throwError } from "./errors";

/**
 * A NetSuite record Internal ID, as it is returned from the Record.getValue() method.
 */
export type InternalId = `${number}`;

function validateNsIdSlug(slug: string): string {
  const invalidCharacters = slug.match(/[^a-z_]/);
  if (invalidCharacters !== null) {
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
