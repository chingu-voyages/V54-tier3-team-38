export interface Asset {
    id: number;  // Unique identifier
    gridX: number; // X-coordinate on the grid
    gridY: number; // Y-coordinate on the grid
    width?: number; // (Optional) Width of the asset in grid units
    height?: number; // (Optional) Height of the asset in grid units
    name: string;  // Asset name
    description?: string; // (Optional) Description of the asset
    imageUrl?: string; // (Optional) Image URL
    rotation?: number; // (Optional) Rotation angle in degrees
}