import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  onClose: (reason: "backdropClick" | "escapeKeyDown") => void;
  onConfirm: () => void;
  title: string;
  contentText: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonColor: string;
  cancelButtonColor?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "確認操作",
  contentText = "您確定要進行此操作嗎？此操作無法撤銷。",
  confirmButtonText = "確定",
  cancelButtonText = "取消",
  confirmButtonColor = "#6db96d",
  cancelButtonColor = "gray",
}) => {
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
