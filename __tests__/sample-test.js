import message from "N/ui/message";
import { pageInit } from "../src/FileCabinet/SuiteScripts/example-directory/example";

jest.mock("N/ui/message");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Basic jest test with simple assert", () => {
  it("should assert strings are equal", () => {
    const a = "foobar";
    const b = "foobar";
    expect(a).toMatch(b);
  });
});

describe("Example of a test with mock SuiteScript functionality", () => {
  it("should create and display a message", () => {
    // given
    const Message = {
      show: jest.fn(() => null),
    };
    message.create.mockReturnValue(Message);
    const context = {
      currentRecord: {
        getText: () => "World!",
      },
    };

    // when
    pageInit(context);

    // then
    expect(message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Hello, ",
        message: "World!",
      }),
    );
    expect(Message.show).toHaveBeenCalledTimes(1);
  });
});
