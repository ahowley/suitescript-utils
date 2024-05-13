import error from "N/error";
import { fieldId } from "../src/FileCabinet/SuiteScripts/utils/netsuite-ui";

jest.mock("N/error");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("validating field and form custom ids are in the right format", () => {
  it("should allow lowercase letters and underscores", () => {
    const id = fieldId("test");
    const expectedId = "custpage_fld_test";
    expect(id).toBe(expectedId);
  });

  it("should disallow capitals, numbers, and spaces", () => {
    error.create.mockReturnValue("error");
    expect(() => fieldId("Test")).toThrow("error");
    expect(() => fieldId("test_1")).toThrow("error");
    expect(() => fieldId("test one")).toThrow("error");
  });
});
