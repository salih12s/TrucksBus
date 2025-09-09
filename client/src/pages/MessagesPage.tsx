import React from "react";
import { Box } from "@mui/material";
import MessagingSystem from "../components/messaging/MessagingSystemNew";
import { useAppSelector } from "../hooks/redux";
import { Navigate } from "react-router-dom";

const MessagesPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      <MessagingSystem />
    </Box>
  );
};

export default MessagesPage;
