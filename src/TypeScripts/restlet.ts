/**
 * restlet.ts
 * @NApiVersion 2.1
 *
 * This module contains common utilities pertaining to RESTlet scripts, including context/request validation.
 */

import { throwError } from "./errors";

export type JSONPrimitive = string | number | boolean | null;

export type JSONObject = { [key: string]: JSONPrimitive | JSONObject | JSONArray };

export type JSONArray = (JSONPrimitive | JSONObject | JSONArray)[];

export type RestletSuccessfulResponse<T extends JSONObject> = {
  status: number;
  data: T;
};

export type RestletErrorResponse = {
  status: number;
  name: string;
  message: string;
};

export type JSONType = JSONPrimitive | JSONType[] | { [key: string]: JSONType };

export type JSONTypeName = "string" | "number" | "boolean" | "null" | "object" | "array";

export type RestletParamSchema<
  JSONType extends JSONTypeName | "primitive" | "tuple",
  IsRoot extends boolean,
  IsArrayElement extends boolean,
> = { type: JSONType } & (IsRoot extends true
  ? {}
  : IsArrayElement extends true
    ? {}
    : {
        param: string;
        required: boolean;
      }) &
  (JSONType extends "array"
    ? {
        arrayType: RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, true>;
      }
    : {}) &
  (JSONType extends "tuple"
    ? {
        tupleType: RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, true>[];
      }
    : {}) &
  (JSONType extends "object"
    ? {
        properties: RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, boolean>[];
      }
    : {});

export const restletError = {
  missingRequiredParam: (paramName: string): RestletErrorResponse => ({
    status: 400,
    name: "Request Error - Missing Required Parameter",
    message: `The parameter '${paramName}' was missing from the request, but is required for this endpoint.`,
  }),
  wrongParamName: (paramName: string): RestletErrorResponse => ({
    status: 400,
    name: "Request Error - Invalid Parameter Name",
    message: `The parameter with name '${paramName}' was unexpected in this request.`,
  }),
  wrongParamType: (paramName: string, paramTypeName: string, expectedTypeName: string): RestletErrorResponse => ({
    status: 400,
    name: "Request Error - Incorrect Parameter Type",
    message: `The parameter '${paramName}' has the type '${paramTypeName}', but was expected to have the type '${expectedTypeName}' instead.`,
  }),
  asResponse: (error: any, status?: number): RestletErrorResponse => {
    const name = error?.name;
    const message = error?.message;
    if (status !== undefined && [name, message].every(errorComponent => typeof errorComponent === "string")) {
      return { status, name, message };
    }

    return {
      status: 500,
      name: "NG_UNKNOWN_ERROR",
      message: "Something unexpected went wrong in the RESTlet endpoint.",
    };
  },
} satisfies { [errorType: string]: (...args: any) => RestletErrorResponse };

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
  paramValue: JSONType | undefined,
  schema: RestletParamSchema<JSONTypeName | "primitive" | "tuple", boolean, boolean>,
): RestletErrorResponse | null {
  const schemaAsTupleSchema = schema as RestletParamSchema<"tuple", false, false>;
  const schemaAsArraySchema = schema as RestletParamSchema<"array", false, false>;
  const schemaAsObjectSchema = schema as RestletParamSchema<"object", false, false>;

  if (paramValue === undefined) {
    if (schemaAsObjectSchema.required) {
      return restletError.missingRequiredParam(schemaAsObjectSchema.param ?? "[root or array member]");
    }

    return null;
  }

  const paramType = jsonType(paramValue);
  const isInvalidType = schema.type !== "primitive" && schema.type !== "tuple" && paramType !== schema.type;
  const isInvalidPrimitive =
    (schema.type as "primitive") === "primitive" && !["string", "number", "boolean", "null"].includes(paramType);
  const isInvalidTuple = (schema.type as "tuple") === "tuple" && paramType !== "array";
  if (isInvalidType || isInvalidPrimitive || isInvalidTuple) {
    return restletError.wrongParamType(
      (schema as RestletParamSchema<"object", false, false>).param ?? "[root or array member]",
      paramType,
      schema.type,
    );
  }

  if ((schema.type as "tuple") === "tuple") {
    for (const [index, tupleSchema] of schemaAsTupleSchema.tupleType.entries()) {
      const tupleValueAtIndex = (paramValue as JSONType[])[index];
      if (tupleValueAtIndex === undefined) {
        return restletError.missingRequiredParam(
          `${schemaAsObjectSchema.param ?? "[root or array member]"} tuple, index ${index}`,
        );
      }

      const validationError = validateRequestParam(tupleValueAtIndex, tupleSchema);
      if (validationError) {
        return validationError;
      }
    }
  } else if (paramType === "array") {
    for (const nestedParamValue of paramValue as JSONType[]) {
      const validationError = validateRequestParam(nestedParamValue, schemaAsArraySchema.arrayType!);
      if (validationError) {
        return validationError;
      }
    }

    return null;
  } else if (paramType === "object") {
    const nestedParams = Object.entries(paramValue as { [param: string]: JSONType });

    for (const nestedSchema of schemaAsObjectSchema.properties) {
      const nestedSchemaAsPropertySchema = nestedSchema as RestletParamSchema<
        JSONTypeName | "primitive" | "tuple",
        false,
        false
      >;
      if (!(nestedSchemaAsPropertySchema.param! in (paramValue as Object)) && nestedSchemaAsPropertySchema.required) {
        return restletError.missingRequiredParam(nestedSchemaAsPropertySchema.param!);
      }
    }

    for (const [nestedParam, nestedParamValue] of nestedParams) {
      const nestedParamSchema = schemaAsObjectSchema.properties.find(
        prop => (prop as RestletParamSchema<JSONTypeName | "primitive" | "tuple", false, false>).param === nestedParam,
      );
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
