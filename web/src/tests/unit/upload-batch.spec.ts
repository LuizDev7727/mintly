import {
  describeBatchResult,
  summarizeUploadBatch,
  type UploadOutcome,
} from "@/pages/orgs/$slug/channels/$channel/create-upload/-components/upload-batch";

const uploaded = (id: string): UploadOutcome<string> => ({
  status: "uploaded",
  id,
  item: `file-${id}`,
  key: `key-${id}`,
});

describe("summarizeUploadBatch", () => {
  it("should keep only the uploaded files and count the rest", () => {
    const summary = summarizeUploadBatch<string>([
      uploaded("a"),
      { status: "failed", id: "b" },
      uploaded("c"),
      { status: "cancelled", id: "d" },
    ]);

    expect(summary.uploaded.map(({ id }) => id)).toEqual(["a", "c"]);
    expect(summary.notUploadedCount).toBe(2);
  });

  it("should report nothing left when every file was uploaded", () => {
    const summary = summarizeUploadBatch<string>([uploaded("a"), uploaded("b")]);

    expect(summary.uploaded).toHaveLength(2);
    expect(summary.notUploadedCount).toBe(0);
  });

  it("should report no uploaded file when everything failed", () => {
    const summary = summarizeUploadBatch<string>([
      { status: "failed", id: "a" },
      { status: "cancelled", id: "b" },
    ]);

    expect(summary.uploaded).toHaveLength(0);
    expect(summary.notUploadedCount).toBe(2);
  });
});

describe("describeBatchResult", () => {
  it("should confirm the posts when every file was uploaded", () => {
    expect(describeBatchResult({ createdCount: 1, notUploadedCount: 0 })).toEqual({
      type: "success",
      message: "1 post created.",
    });

    expect(describeBatchResult({ createdCount: 3, notUploadedCount: 0 })).toEqual({
      type: "success",
      message: "3 posts created.",
    });
  });

  it("should warn that some files are still on the screen when part of the batch failed", () => {
    expect(describeBatchResult({ createdCount: 2, notUploadedCount: 1 })).toEqual({
      type: "warning",
      message: "2 posts created. 1 file was not uploaded and is still here.",
    });

    expect(describeBatchResult({ createdCount: 1, notUploadedCount: 2 })).toEqual({
      type: "warning",
      message: "1 post created. 2 files were not uploaded and are still here.",
    });
  });

  it("should report an error when no file was uploaded", () => {
    expect(describeBatchResult({ createdCount: 0, notUploadedCount: 1 })).toEqual({
      type: "error",
      message: "1 file was not uploaded. Try again.",
    });

    expect(describeBatchResult({ createdCount: 0, notUploadedCount: 3 })).toEqual({
      type: "error",
      message: "3 files were not uploaded. Try again.",
    });
  });
});
