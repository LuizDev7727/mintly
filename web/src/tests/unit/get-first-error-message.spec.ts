import { getFirstErrorMessage } from "@/pages/orgs/$slug/channels/$channel/create-upload/-components/get-first-error-message";

describe("getFirstErrorMessage", () => {
  it("should find the message of a nested field error", () => {
    const errors = {
      posts: [
        undefined,
        {
          socialsToPost: {
            type: "too_small",
            message: "Post needs at least one integration selected",
          },
        },
      ],
    };

    expect(getFirstErrorMessage(errors)).toBe(
      "Post needs at least one integration selected",
    );
  });

  it("should return the first message when there are several errors", () => {
    const errors = {
      posts: [
        { scheduledTo: { message: "The date cannot be in the past" } },
        { socialsToPost: { message: "Post needs at least one integration selected" } },
      ],
    };

    expect(getFirstErrorMessage(errors)).toBe("The date cannot be in the past");
  });

  it("should not walk into the ref of a field", () => {
    const errors = { posts: [{ file: { ref: { message: "from the DOM" } } }] };

    expect(getFirstErrorMessage(errors)).toBeUndefined();
  });

  it("should return undefined when there is no error", () => {
    expect(getFirstErrorMessage({})).toBeUndefined();
    expect(getFirstErrorMessage(undefined)).toBeUndefined();
  });
});
