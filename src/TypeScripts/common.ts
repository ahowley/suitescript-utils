/**
 * common.ts
 * @NApiVersion 2.1
 * A collection of common types, basic utility functions, etc. used across SDF account customization projects.
 */

import { throwError } from "./errors";
import { Type as RecordType } from "N/record";

/**
 * A NetSuite record Internal ID, as it is returned from the Record.getValue() method.
 */
export type InternalId = `${number}`;

function validateNsIdSlug(slug: string): string {
  const invalidCharacters = slug.match(/[^a-z0-9_]/);
  if (invalidCharacters !== null) {
    throwError.wrongType(
      "slug",
      slug,
      "A custom form element ID can only consist of lowercase letters, numbers, and underscores.",
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

/**
 * A map from NetSuite field types to their constructors in JavaScript. This can be useful when
 * trying to manage types related to Record.setValue() and Record.getValue() methods.
 *
 * Note that select fields return Internal IDs that are numbers as strings (hence the InternalId type
 * included in our common module), and multiselect fields return an array of strings (if custom select
 * values are used) or InternalIds (still as strings).
 */
export const NS_FIELD_VALUE_JS_CONSTRUCTORS = {
  checkbox: Boolean,
  currency: Number,
  date: Date,
  datetime: Date,
  datetimetz: Date,
  float: Number,
  email: String,
  text: String,
  help: String,
  url: String,
  inlinehtml: String,
  integer: Number,
  select: String,
  multiselect: Array,
  password: String,
  longtext: String,
  percent: Number,
  phone: String,
  richtext: String,
  textarea: String,
  timeofday: Date,
  identifier: String,
};

type TransactionType =
  | RecordType.EXPENSE_REPORT
  | RecordType.CREDIT_CARD_CHARGE
  | RecordType.PURCHASE_ORDER
  | RecordType.ITEM_RECEIPT
  | RecordType.SALES_ORDER
  | RecordType.CHECK
  | RecordType.CREDIT_MEMO
  | RecordType.CUSTOMER_REFUND
  | RecordType.VENDOR_PREPAYMENT
  | RecordType.VENDOR_CREDIT
  | RecordType.ITEM_FULFILLMENT
  | RecordType.VENDOR_PAYMENT
  | RecordType.CUSTOMER_PAYMENT
  | RecordType.CASH_REFUND
  | RecordType.INVOICE
  | RecordType.DEPOSIT
  | RecordType.INVENTORY_ADJUSTMENT
  | RecordType.VENDOR_BILL
  | RecordType.JOURNAL_ENTRY;
/**
 * This utility provides a Map from the string values of the Record.Type SuiteScript enum to their display text values as
 * they appear in NetSuite saved searches, SuiteQL queries, etc. This is a function and not an exported constant because
 * SuiteScript can only use imported module members in a deployment, which means module-level code can't access SuiteScript APIs.
 *
 * @param reverse: Optionally set this parameter to true to get a map from display values to transaction types, rather than
 * the other way around.
 */
export function getTransactionTypeDisplayValueMap(reverse?: true) {
  // These values *are* strings, but the hitc SuiteScript types package calls them an enum, so we have to cast them
  const valueArray: [string, string][] = [
    [RecordType.EXPENSE_REPORT as any as string, "ExpRept"],
    [RecordType.CREDIT_CARD_CHARGE as any as string, "CardChrg"],
    [RecordType.PURCHASE_ORDER as any as string, "PurchOrd"],
    [RecordType.ITEM_RECEIPT as any as string, "ItemRcpt"],
    [RecordType.SALES_ORDER as any as string, "SalesOrd"],
    [RecordType.CHECK as any as string, "Check"],
    [RecordType.CREDIT_MEMO as any as string, "CustCred"],
    [RecordType.CUSTOMER_REFUND as any as string, "CustRfnd"],
    [RecordType.VENDOR_PREPAYMENT as any as string, "VPrep"],
    [RecordType.VENDOR_CREDIT as any as string, "VendCred"],
    [RecordType.ITEM_FULFILLMENT as any as string, "ItemShip"],
    [RecordType.VENDOR_PAYMENT as any as string, "VendPymt"],
    [RecordType.CUSTOMER_PAYMENT as any as string, "CustPymt"],
    [RecordType.CASH_REFUND as any as string, "CashRfnd"],
    [RecordType.INVOICE as any as string, "CustInvc"],
    [RecordType.DEPOSIT as any as string, "Deposit"],
    [RecordType.INVENTORY_ADJUSTMENT as any as string, "InvAdjst"],
    [RecordType.VENDOR_BILL as any as string, "VendBill"],
    [RecordType.JOURNAL_ENTRY as any as string, "Journal"],
  ];
  if (reverse) valueArray.forEach(tuple => tuple.reverse());

  return new Map<string, string>(valueArray);
}
