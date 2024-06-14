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
  Type extends JSONTypeName | "primitive" | "tuple" | "values" | "overloaded",
  IsRoot extends boolean,
  IsArrayElement extends boolean,
> = { type: Type } & (IsRoot extends true
  ? {}
  : IsArrayElement extends true
    ? {}
    : {
        param: string;
        required: boolean;
      }) &
  (Type extends "array"
    ? {
        arrayType: RestletParamSchema<JSONTypeName | "primitive" | "tuple" | "values" | "overloaded", false, true>;
      }
    : {}) &
  (Type extends "tuple"
    ? {
        tupleType: RestletParamSchema<JSONTypeName | "primitive" | "tuple" | "values" | "overloaded", false, true>[];
      }
    : {}) &
  (Type extends "object"
    ? {
        properties: RestletParamSchema<
          JSONTypeName | "primitive" | "tuple" | "values" | "overloaded",
          false,
          boolean
        >[];
      }
    : {}) &
  (Type extends "values"
    ? {
        values: JSONPrimitive[];
      }
    : {}) &
  (Type extends "overloaded"
    ? {
        overloads: RestletParamSchema<JSONTypeName | "primitive" | "tuple" | "values", false, true>[];
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
  wrongParamValue: (
    paramName: string,
    paramValue: JSONType,
    expectedParamValues: JSONPrimitive[],
  ): RestletErrorResponse => ({
    status: 400,
    name: "Request Error - Incorrect Parameter Value",
    message: `The parameter '${paramName}' with the value '${paramValue}' was not found in the expected value list: '${JSON.stringify(expectedParamValues)}'`,
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
 * Validate that the type of a value matches its expected type.
 */
function validateRequestParamType(
  paramValue: JSONType,
  schema: RestletParamSchema<JSONTypeName | "primitive" | "tuple" | "values" | "overloaded", boolean, boolean>,
): RestletErrorResponse | null {
  const paramType = jsonType(paramValue);
  const schemaAsObjectSchema = schema as RestletParamSchema<"object", false, false>;
  const schemaAsOverloadedSchema = schema as RestletParamSchema<"overloaded", false, false>;

  if (schema.type === "overloaded") {
    const validationErrors = schemaAsOverloadedSchema.overloads
      .map(possibleSchema => validateRequestParam(paramValue, possibleSchema))
      .filter(validationError =>
        ["Request Error - Incorrect Parameter Value", "Request Error - Incorrect Parameter Type"].includes(
          validationError?.name ?? "",
        ),
      );

    if (validationErrors.length === schemaAsOverloadedSchema.overloads.length) {
      return restletError.wrongParamType(
        schemaAsOverloadedSchema.param ?? "[root or array member]",
        paramType,
        schemaAsOverloadedSchema.overloads
          .map(overload => {
            const overloadAsTupleSchema = overload as RestletParamSchema<"tuple", false, false>;
            const overloadAsArraySchema = overload as RestletParamSchema<"array", false, false>;
            return `${overload.type}${
              overloadAsTupleSchema.tupleType
                ? ` (${overloadAsTupleSchema.tupleType.map(member => member.type).join(", ")})`
                : ""
            }${overloadAsArraySchema.arrayType ? ` (${overloadAsArraySchema.arrayType.type})` : ""}`;
          })
          .join(" | "),
      );
    }

    return null;
  }

  const isInvalidType = schema.type !== "primitive" && schema.type !== "tuple" && paramType !== schema.type;
  const isInvalidPrimitive =
    schema.type === "primitive" && !["string", "number", "boolean", "null"].includes(paramType);
  const isInvalidTuple = schema.type === "tuple" && paramType !== "array";

  if (schema.type !== "values" && (isInvalidType || isInvalidPrimitive || isInvalidTuple)) {
    return restletError.wrongParamType(schemaAsObjectSchema.param ?? "[root or array member]", paramType, schema.type);
  }

  return null;
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
  schema: RestletParamSchema<JSONTypeName | "primitive" | "tuple" | "values" | "overloaded", boolean, boolean>,
): RestletErrorResponse | null {
  const schemaAsTupleSchema = schema as RestletParamSchema<"tuple", false, false>;
  const schemaAsArraySchema = schema as RestletParamSchema<"array", false, false>;
  const schemaAsObjectSchema = schema as RestletParamSchema<"object", false, false>;
  const schemaAsValuesSchema = schema as RestletParamSchema<"values", false, false>;

  if (paramValue === undefined) {
    if (schemaAsObjectSchema.required) {
      return restletError.missingRequiredParam(schemaAsObjectSchema.param ?? "[root or array member]");
    }

    return null;
  }

  const isInvalidValue =
    schema.type === "values" && !schemaAsValuesSchema.values?.includes(paramValue as JSONPrimitive);
  if (isInvalidValue) {
    return restletError.wrongParamValue(
      schemaAsObjectSchema.param ?? "[root or array member]",
      paramValue,
      schemaAsValuesSchema.values,
    );
  } else {
    const wrongType = validateRequestParamType(paramValue, schema);
    if (wrongType) return wrongType;
  }

  const paramType = jsonType(paramValue);
  if (schema.type === "tuple") {
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
  } else if (paramType === "array" && schema.type !== "overloaded") {
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
