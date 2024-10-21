import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ConfirmDialogProps } from "../types/GlobalComponents";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "確認操作",
  contentText = "您確定要進行此操作嗎？此操作無法撤銷。",
  confirmButtonText = "確定",
  cancelButtonText = "取消",
  confirmButtonColor = "#6db96d",
  cancelButtonColor = "gray",
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={(_event, reason) => onClose(reason)}>
      <DialogTitle sx={{ fontFamily: "KG Second Chances" }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontFamily: "KG Second Chances" }}>
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ fontFamily: "KG Second Chances", color: cancelButtonColor }}
          onClick={() => onClose("escapeKeyDown")}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={onConfirm}
          sx={{ fontFamily: "KG Second Chances", color: confirmButtonColor }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
