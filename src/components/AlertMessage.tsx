import React from "react";
import { Alert, AlertTitle } from "@mui/material";

interface AlertMessageProps {
  message: string;
  severity: "error" | "warning" | "info" | "success";
  title?: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  severity,
  title,
}) => {
  return (
    <Alert severity={severity}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default AlertMessage;
