import { useEffect } from "react";
import { testConnection } from "../api/backendService";

const TestConnection = () => {
  useEffect(() => {
    console.log("🌍 API Base URL:", import.meta.env.VITE_BASE_URL);
    testConnection();
  }, []);

  return null; // no UI, just runs in the background
};

export default TestConnection;
