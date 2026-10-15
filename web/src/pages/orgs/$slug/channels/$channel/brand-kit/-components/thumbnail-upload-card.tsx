import { AlertCircle, RotateCcw, X } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";
import type { ThumbnailUpload } from "./use-inspirational-thumbnail-uploads";

interface ThumbnailUploadCardProps {
  upload: ThumbnailUpload;
  variant: "tile" | "row";
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ThumbnailUploadCard({
  upload,
  variant,
  onCancel,
  onRetry,
  onDismiss,
}: ThumbnailUploadCardProps) {
  const { file, status, progress } = upload;

  const hasFailed = status === "error";
  const isProcessing = status === "processing";

  return (
    <div
      data-variant={variant}
      className="flex items-center data-[variant=tile]:min-h-32"
    >
      <Attachment state={status} className="w-full">
        <AttachmentMedia>
          {hasFailed ? <AlertCircle /> : <Spinner />}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{file.name}</AttachmentTitle>
          <AttachmentDescription>
            {hasFailed && "Upload failed"}
            {isProcessing && "Optimizing…"}
            {status === "uploading" && `Uploading · ${progress}%`}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {hasFailed ? (
            <>
              <AttachmentAction
                aria-label={`Retry upload of ${file.name}`}
                onClick={onRetry}
              >
                <RotateCcw />
              </AttachmentAction>
              <AttachmentAction
                aria-label={`Dismiss ${file.name}`}
                onClick={onDismiss}
              >
                <X />
              </AttachmentAction>
            </>
          ) : (
            <AttachmentAction
              aria-label={`Cancel upload of ${file.name}`}
              disabled={isProcessing}
              onClick={onCancel}
            >
              <X />
            </AttachmentAction>
          )}
        </AttachmentActions>
      </Attachment>
    </div>
  );
}
