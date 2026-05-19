import { StatusAlert } from "@/shared/ui/StatusAlert";

type GalleryStatusAlertsProps = {
  successMessage: string;
  errorMessage: string;
  onCloseSuccess: () => void;
  onCloseError: () => void;
};

export function GalleryStatusAlerts({
  successMessage,
  errorMessage,
  onCloseSuccess,
  onCloseError,
}: GalleryStatusAlertsProps) {
  return (
    <>
      {successMessage && (
        <div className="absolute top-[30px] right-[30px] left-[30px] z-40 min-[900px]:left-auto min-[900px]:w-[550px]">
          <StatusAlert
            variant="success"
            title="Success"
            onClose={onCloseSuccess}
            autoCloseMs={3000}
            tooltipText={successMessage}
          >
            {successMessage}
          </StatusAlert>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-[30px] right-[30px] left-[30px] z-40 min-[900px]:left-auto min-[900px]:w-[550px]">
          <StatusAlert
            variant="error"
            title="Error"
            onClose={onCloseError}
            autoCloseMs={3000}
            tooltipText={errorMessage}
          >
            {errorMessage}
          </StatusAlert>
        </div>
      )}
    </>
  );
}
