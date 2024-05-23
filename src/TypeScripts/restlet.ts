/**
 * restlet.ts
 * @NApiVersion 2.1
 *
 * This module contains common utilities pertaining to RESTlet scripts, including context/request validation.
 */

import { throwError } from "./errors";

export type RestletSuccessfulResponse<T extends { [key: string]: string | number | boolean | null }> = {
  status: number;
  data: T;
};

export type RestletErrorResponse = {
  status: number;
  name: string;
  message: string;
};

export type JSONPrimitive = string | number | boolean | null;

export type JSONType = JSONPrimitive | JSONType[] | { [key: string]: JSONType };

export type JSONTypeName = "string" | "number" | "boolean" | "null" | "object" | "array";

export type RestletParamSchema<T extends JSONTypeName> = {
  param: T extends "array" ? undefined | string : string;
  type: T;
  arrayType: T extends "array" ? RestletParamSchema<JSONTypeName> : undefined;
  properties: T extends "object" ? RestletParamSchema<JSONTypeName>[] : undefined;
};

export const restletError = {
  missingRequiredParam: (paramName: string) =>
    ({
      status: 400,
      name: "Request Error - Missing Required Parameter",
      message: `The parameter '${paramName}' was missing from the request, but is required for this endpoint.`,
    }) as RestletErrorResponse,
  wrongParamName: (paramName: string) => ({
    status: 400,
    name: "Request Error - Invalid Parameter Name",
    message: `The parameter with name '${paramName}' was unexpected in this request.`,
  }),
  wrongParamType: (paramName: string, paramTypeName: string, expectedTypeName: string) =>
    ({
      status: 400,
      name: "Request Error - Incorrect Parameter Type",
      message: `The parameter '${paramName}' has the type '${paramTypeName}', but was expected to have the type '${expectedTypeName}' instead.`,
    }) as RestletErrorResponse,
};

/**
 * Similar to `typeof value`, but with enough detail to cover all possible JSON value types, including arrays and objects.
 *
 * @param val - The value you want the type name from.
 */
export function jsonType(val: JSONType): JSONTypeName {
  if (["string", "number", "boolean"].includes(typeof val)) return typeof val as "string" | "number" | "boolean";
  if (val === null) return "null";
  if ((val as JSONType[]).length !== undefined) return "array";
  if ((val as Object).constructor.name === "Object") return "object";

  return throwError.shouldBeUnreachable(
    "The value passed to the jsonType function could not have been gathered by parsing JSON.",
  );
}

/**
 * Validate the type of a single request parameter by comparing it to its schema,
 * accounting for nested JSON objects and arrays.
 *
 * @param paramValue - The value of the parameter being validated.
 * @param schema - An object representing this values expected type.
 */
export function validateRequestParamType(
  paramValue: JSONType,
  { param, type, arrayType, properties }: RestletParamSchema<JSONTypeName>,
): RestletErrorResponse | null {
  const paramType = jsonType(paramValue);
  if (paramType !== type) {
    return restletError.wrongParamType(param ?? "[unnamed array]", paramType, type);
  }

  if (paramType === "array") {
    for (const nestedParamValue of paramValue as JSONType[]) {
      const validationError = validateRequestParamType(nestedParamValue, arrayType!);
      if (validationError) {
        return validationError;
      }
    }

    return null;
  } else if (paramType === "object") {
    const nestedParams = Object.entries(paramValue as { [param: string]: JSONType });

    for (const [nestedParam, nestedParamValue] of nestedParams) {
      const nestedParamSchema = properties!.find(prop => prop.param === nestedParam);
      if (!nestedParamSchema) {
        return restletError.wrongParamName(nestedParam);
      }

      const validationError = validateRequestParamType(nestedParamValue, nestedParamSchema);
      if (validationError) {
        return validationError;
      }
    }
  }

  return null;
}

/**
 * Validate incoming request parameters - that they exist, that they are the correct types,
 * and that all expected parameters are present, accounting for nested JSON objects and arrays.
 *
 * @param params - An object containing the request parameters, usually from a RESTlet entry
 * point.
 * @param schema - An array of objects representing the types of each key-value pair. Allows for
 * recursion and nested schema.
 */
export function validateRequestParams(
  params: { [param: string]: JSONType },
  schema: RestletParamSchema<JSONTypeName>[],
): RestletErrorResponse | null {
  for (const [paramName, paramValue] of Object.entries(params)) {
    const paramSchema = schema.find(prop => prop.param === paramName);
    if (!paramSchema) {
      return restletError.wrongParamName(paramName);
    }

    const validationError = validateRequestParamType(paramValue, paramSchema!);
    if (validationError) {
      return validationError;
    }
  }

  return null;
}
