export interface AlertMessageProp {
  message: string;
}

export interface ButtonProps {
  id?: string;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  margin?: string;
  disabled?: boolean;
  color?: string;
  backgroundColor?: string;
  strokeColor?: string;
  justifyContent?: "flex-start" | "center" | "flex-end";
  icon?: string;
}
export interface ConfirmDialogProps {
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
export interface JoyrideProps {
  run: boolean;
  setRun: (run: boolean) => void;
}
export interface LoadingProps {
  isLoading: boolean;
}
