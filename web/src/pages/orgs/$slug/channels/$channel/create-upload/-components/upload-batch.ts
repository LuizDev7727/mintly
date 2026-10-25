export type UploadOutcome<TItem> =
  | { status: "uploaded"; id: string; item: TItem; key: string }
  | { status: "cancelled"; id: string }
  | { status: "failed"; id: string };

export type UploadedOutcome<TItem> = Extract<
  UploadOutcome<TItem>,
  { status: "uploaded" }
>;

type UploadBatchSummary<TItem> = {
  uploaded: UploadedOutcome<TItem>[];
  notUploadedCount: number;
};

// Separa o que subiu do que não subiu (falha ou cancelamento) num lote de
// uploads. Só o que subiu vira post; o resto continua na tela.
export function summarizeUploadBatch<TItem>(
  outcomes: UploadOutcome<TItem>[],
): UploadBatchSummary<TItem> {
  const uploaded = outcomes.filter(
    (outcome): outcome is UploadedOutcome<TItem> => outcome.status === "uploaded",
  );

  return { uploaded, notUploadedCount: outcomes.length - uploaded.length };
}

type BatchResultMessage = {
  type: "success" | "warning" | "error";
  message: string;
};

type DescribeBatchResultParams = {
  createdCount: number;
  notUploadedCount: number;
};

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export function describeBatchResult(
  params: DescribeBatchResultParams,
): BatchResultMessage {
  const { createdCount, notUploadedCount } = params;

  if (createdCount === 0) {
    return {
      type: "error",
      message: `${pluralize(notUploadedCount, "file was", "files were")} not uploaded. Try again.`,
    };
  }

  if (notUploadedCount === 0) {
    return {
      type: "success",
      message: `${pluralize(createdCount, "post", "posts")} created.`,
    };
  }

  return {
    type: "warning",
    message: `${pluralize(createdCount, "post", "posts")} created. ${pluralize(notUploadedCount, "file was", "files were")} not uploaded and ${notUploadedCount === 1 ? "is" : "are"} still here.`,
  };
}
