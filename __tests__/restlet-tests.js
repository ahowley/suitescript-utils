import { validateRequestParam, restletError } from "../src/FileCabinet/SuiteScripts/utils/restlet";

const TEST_PARAM_SCHEMA = {
  type: "object",
  properties: [
    {
      param: "stringparam",
      type: "string",
      required: true,
    },
    {
      param: "numberparam",
      type: "number",
      required: true,
    },
    {
      param: "booleanparam",
      type: "boolean",
      required: true,
    },
    {
      param: "nullparam",
      type: "null",
      required: true,
    },
    {
      param: "primitiveparam",
      type: "primitive",
      required: false,
    },
    {
      param: "objectparam",
      type: "object",
      properties: [
        {
          param: "nestedarrayparam",
          type: "array",
          arrayType: {
            type: "string",
          },
          required: true,
        },
      ],
      required: true,
    },
    {
      param: "arrayparam",
      type: "array",
      arrayType: {
        type: "number",
      },
      required: true,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("request param validation", () => {
  it("should return null if all types are correct", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const validParams = {
      stringparam: "foo",
      numberparam: 1,
      booleanparam: true,
      nullparam: null,
      primitiveparam: true,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
    };

    // when
    const validationError = validateRequestParam(validParams, schema);

    //then
    expect(validationError).toBe(null);
  });

  it("should allow for optional parameters to be omitted", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const validParams = {
      stringparam: "foo",
      numberparam: 1,
      booleanparam: true,
      nullparam: null,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
    };

    // when
    const validationError = validateRequestParam(validParams, schema);

    //then
    expect(validationError).toBe(null);
  });

  it("should return wrongParamType if primitive type is incorrect", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const invalidParams = {
      stringparam: "foo",
      numberparam: "1",
      booleanparam: true,
      nullparam: null,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
    };

    // when
    const validationError = validateRequestParam(invalidParams, schema);

    //then
    expect(validationError).toEqual({
      status: 400,
      name: "Request Error - Incorrect Parameter Type",
      message: "The parameter 'numberparam' has the type 'string', but was expected to have the type 'number' instead.",
    });
  });

  it("should return wrongParamType if param is set to a primitive but the value isn't a primitive", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const invalidParams = {
      stringparam: "foo",
      numberparam: 1,
      booleanparam: true,
      nullparam: null,
      primitiveparam: [true],
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
    };

    // when
    const validationError = validateRequestParam(invalidParams, schema);

    //then
    expect(validationError).toEqual({
      status: 400,
      name: "Request Error - Incorrect Parameter Type",
      message:
        "The parameter 'primitiveparam' has the type 'array', but was expected to have the type 'primitive' instead.",
    });
  });

  it("should return wrongParamType if nested primitive is incorrect type", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const invalidParams = {
      stringparam: "foo",
      numberparam: 1,
      booleanparam: true,
      nullparam: null,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: ["2", 3, 4],
    };

    // when
    const validationError = validateRequestParam(invalidParams, schema);

    // then
    expect(validationError).toEqual({
      status: 400,
      name: "Request Error - Incorrect Parameter Type",
      message:
        "The parameter '[root or array member]' has the type 'string', but was expected to have the type 'number' instead.",
    });
  });

  it("should return missingRequiredParam if required parameter is missing", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const invalidParams = {
      stringparam: "foo",
      numberparam: 1,
      nullparam: null,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
    };

    // when
    const validationError = validateRequestParam(invalidParams, schema);

    // then
    expect(validationError).toEqual({
      status: 400,
      name: "Request Error - Missing Required Parameter",
      message: "The parameter 'booleanparam' was missing from the request, but is required for this endpoint.",
    });
  });

  it("should return wrongParamName if parameter name is not found in schema", () => {
    // given
    const schema = { ...TEST_PARAM_SCHEMA };
    const invalidParams = {
      stringparam: "foo",
      numberparam: 1,
      booleanparam: true,
      nullparam: null,
      objectparam: {
        nestedarrayparam: ["bar", "baz"],
      },
      arrayparam: [2, 3, 4],
      extraparam: false,
    };

    // when
    const validationError = validateRequestParam(invalidParams, schema);

    // then
    expect(validationError).toEqual({
      status: 400,
      name: "Request Error - Invalid Parameter Name",
      message: "The parameter with name 'extraparam' was unexpected in this request.",
    });
  });
});
