/**
 * environment.ts
 * @NApiVersion 2.1
 *
 * This module provides helper functions for fetching information related to a script's runtime environment.
 */

import config, { Type as ConfigType } from "N/config";
import { Timezone } from "N/format";
import { FieldValue } from "N/record";
import runtime, { ContextType, EnvType } from "N/runtime";
import { InternalId } from "./common";

/**
 * Fetches the globally-set company timezone from the Company Information settings (located under
 * Setup > Company > Company Information in the Classic Center).
 *
 * Governance usage: 10 units
 */
export function getTimezone(): Timezone {
  const companyConfig = config.load({ type: ConfigType.COMPANY_INFORMATION });
  const timezone = companyConfig.getValue("timezone") as Timezone;
  return timezone;
}

/**
 * Whether the currently running script deployment is running in the sandbox environment.
 *
 * Governance usage: none
 */
export function isSandbox(): boolean {
  return runtime.envType === EnvType.SANDBOX;
}

/**
 * Whether the currently running script deployment is a client script.
 *
 * Governance usage: none
 */
export function isClient(): boolean {
  return [ContextType.CLIENT, ContextType.USER_INTERFACE].includes(runtime.executionContext);
}

/**
 * Whether the currently running script deployment is a client script.
 *
 * Governance usage: none
 */
export function isServer(): boolean {
  return [
    ContextType.RESTLET,
    ContextType.SUITELET,
    ContextType.SCHEDULED,
    ContextType.MAP_REDUCE,
    ContextType.USEREVENT,
  ].includes(runtime.executionContext);
}

function script() {
  return runtime.getCurrentScript();
}

/**
 * Get the remaining usage for the currently running script deployment.
 *
 * Governance usage: none
 */
export function remainingUsage(): number {
  return script().getRemainingUsage();
}

/**
 * Gets the value of one of the current running script deployment's parameters.
 *
 * Governance usage: none
 */
export function getParam<T extends FieldValue | InternalId | InternalId[]>(paramName: string): T | undefined {
  return script().getParameter({ name: paramName }) as T | undefined;
}
