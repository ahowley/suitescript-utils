import error from "N/error";
import { fieldId } from "../src/FileCabinet/SuiteScripts/utils/common";

jest.mock("N/error");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("validating field and form custom ids are in the right format", () => {
  it("should allow lowercase letters, numbers, and underscores", () => {
    const id = fieldId("test_id_1");
    const expectedId = "custpage_fld_test_id_1";
    expect(id).toBe(expectedId);
  });

  it("should disallow capitals and spaces", () => {
    error.create.mockReturnValue("error");
    expect(() => fieldId("Test")).toThrow("error");
    expect(() => fieldId("test one")).toThrow("error");
  });
});
