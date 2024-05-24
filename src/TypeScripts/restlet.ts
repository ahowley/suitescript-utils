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

export type RestletParamSchema<
  JSONType extends JSONTypeName | "primitive" | "tuple",
  IsRoot extends boolean,
  IsArrayElement extends boolean,
> = {
  param: IsRoot extends true ? void : IsArrayElement extends true ? void : string;
  required: IsRoot extends true ? void : IsArrayElement extends true ? void : boolean;
  type: JSONType;
  arrayType: JSONType extends "array" ? RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, true> : void;
  tupleType: JSONType extends "tuple" ? RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, true>[] : void;
  properties: JSONType extends "object"
    ? RestletParamSchema<JSONTypeName | "primitive" | "tuple", boolean, boolean>[]
    : void;
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
 * Validate request parameter(s) by comparing it to its schema, accounting for nested JSON objects and arrays.
 * In addition to JSON primitives, arrays, and objects, this also allows for defining schemas for "tuples"
 * (positional arrays with a pre-defined number of elements) and "primitives" (to allow more flexible property types).
 *
 * The RestletParamSchema takes three generics to allow for validation-level specificity.
 * - JSONType - Can be "string" | "number" | "boolean" | "null" | "primitive" | "object" | "array" | "tuple"
 * - IsRoot - A boolean specifying whether this is the "root" of the schema (which makes the "param" property void)
 * - IsArrayElement - A boolean specifying whether this schema definition is for an unnamed element of an array
 *
 * @param paramValue - The value of the parameter being validated. Can be any valid JSON data type, "primitive" (which allows
 * any primitive JSON data type), or "tuple" (which allows defining specific positional array element types in the 'tupleType'
 * schema array).
 * @param schema - An object representing this value's expected type. Everything but the "type" property is conditionally optional
 * - i.e. arrayType is only needed for "array"s, tupleType for "tuple"s, and properties for "object"s, etc.
 */
export function validateRequestParam(
  paramValue: JSONType,
  {
    param,
    type,
    arrayType,
    tupleType,
    properties,
  }: RestletParamSchema<JSONTypeName | "primitive" | "tuple", boolean, boolean>,
): RestletErrorResponse | null {
  const paramType = jsonType(paramValue);
  const isInvalidType = type !== "primitive" && type !== "tuple" && paramType !== type;
  const isInvalidPrimitive =
    (type as "primitive") === "primitive" && !["string", "number", "boolean", "null"].includes(paramType);
  const isInvalidTuple = (type as "tuple") === "tuple" && paramType !== "array";
  if (isInvalidType || isInvalidPrimitive || isInvalidTuple) {
    return restletError.wrongParamType(param ?? "[root or array member]", paramType, type);
  }

  if ((type as "tuple") === "tuple") {
    for (const [index, schema] of tupleType!.entries()) {
      const tupleValueAtIndex = (paramValue as JSONType[])[index];
      if (tupleValueAtIndex === undefined) {
        return restletError.missingRequiredParam(`${param ?? "[root or array member]"} tuple, index ${index}`);
      }

      const validationError = validateRequestParam(tupleValueAtIndex, schema);
      if (validationError) {
        return validationError;
      }
    }
  } else if (paramType === "array") {
    for (const nestedParamValue of paramValue as JSONType[]) {
      const validationError = validateRequestParam(nestedParamValue, arrayType!);
      if (validationError) {
        return validationError;
      }
    }

    return null;
  } else if (paramType === "object") {
    const nestedParams = Object.entries(paramValue as { [param: string]: JSONType });

    for (const nestedSchema of properties!) {
      if (!(nestedSchema.param! in (paramValue as Object)) && nestedSchema.required) {
        return restletError.missingRequiredParam(nestedSchema.param!);
      }
    }

    for (const [nestedParam, nestedParamValue] of nestedParams) {
      const nestedParamSchema = properties!.find(prop => prop.param === nestedParam);
      if (!nestedParamSchema) {
        return restletError.wrongParamName(nestedParam);
      }

      const validationError = validateRequestParam(nestedParamValue, nestedParamSchema);
      if (validationError) {
        return validationError;
      }
    }
  }

  return null;
}
