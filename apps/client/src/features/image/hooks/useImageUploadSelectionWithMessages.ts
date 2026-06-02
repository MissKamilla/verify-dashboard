import type { UseImageUploadSelectionResult } from "./useImageUploadSelection";

type UseImageUploadSelectionWithMessagesProps = {
  imageSelection: UseImageUploadSelectionResult;
  clearMessages: () => void;
  clearWarning: () => void;
  setWarningMessage: (message: string) => void;
  onSelectionChange?: () => void;
};

export function useImageUploadSelectionWithMessages({
  imageSelection,
  clearMessages,
  clearWarning,
  setWarningMessage,
  onSelectionChange,
}: UseImageUploadSelectionWithMessagesProps) {
  const selectFiles = (files: File[]) => {
    onSelectionChange?.();
    clearMessages();

    const validationError = imageSelection.selectFiles(files);
    if (validationError) {
      setWarningMessage(validationError);
    }
  };

  const updateMetafield = (
    imageId: string,
    field: "name" | "comment",
    value: string,
  ) => {
    clearWarning();
    imageSelection.updateMetafield(imageId, field, value);
  };

  const closeWarning = () => {
    clearWarning();
    imageSelection.clearFileError();
  };

  return {
    ...imageSelection,
    selectFiles,
    updateMetafield,
    closeWarning,
  };
}
