export interface Asset {
  id: number;
  name: string;
  description: string;
  image: string; // <-- this will be a URL
  created_at: string;
  updated_at: string;
}