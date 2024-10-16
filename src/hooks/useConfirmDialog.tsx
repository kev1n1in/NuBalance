import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import useAlert from "./useAlertMessage";

const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});
  const [dialogData, setDialogData] = useState<string>("");
  const { addAlert } = useAlert();
  const openDialog = (
    data: string,
    confirmCallback: (data: string) => void
  ) => {
    setDialogData(data);
    setOnConfirm(() => () => confirmCallback(data));
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }

    addAlert("Successfully deleted!");

    setTimeout(() => {
      closeDialog();
    }, 100);
  };

  return {
    ConfirmDialogComponent: (
      <ConfirmDialog
        open={open}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title="Confirm Deletion"
        contentText={
          <>
            Are you sure you want to delete
            <span
              style={{ margin: "0 8px", color: "#df522f", fontWeight: "bold" }}
            >
              {dialogData}
            </span>
            ? <br />
            This action cannot be undone.
          </>
        }
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        confirmButtonColor="red"
      />
    ),
    openDialog,
  };
};

export default useConfirmDialog;
