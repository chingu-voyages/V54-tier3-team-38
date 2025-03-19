export interface User {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string; // Optional field
    role?: "admin" | "user"; // Example role system
  }
  