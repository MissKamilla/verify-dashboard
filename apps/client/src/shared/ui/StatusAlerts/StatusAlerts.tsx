import { StatusAlert } from "@/shared/ui/StatusAlert";

type StatusAlertsProps = {
  successMessage: string;
  errorMessage: string;
  warningMessage?: string;
  onCloseSuccess: () => void;
  onCloseError: () => void;
  onCloseWarning?: () => void;
};

export function StatusAlerts({
  successMessage,
  errorMessage,
  warningMessage,
  onCloseSuccess,
  onCloseError,
  onCloseWarning,
}: StatusAlertsProps) {
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

      {warningMessage && (
        <div className="absolute top-[30px] right-[30px] left-[30px] z-40 min-[900px]:left-auto min-[900px]:w-[550px]">
          <StatusAlert
            variant="warning"
            title="Warning"
            onClose={onCloseWarning}
            autoCloseMs={3000}
            tooltipText={warningMessage}
          >
            {warningMessage}
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
