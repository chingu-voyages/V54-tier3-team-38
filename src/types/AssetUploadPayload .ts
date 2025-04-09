export interface AssetUploadPayload {
  name: string;
  description: string;
  image: File; // <-- actual File object for upload
}
