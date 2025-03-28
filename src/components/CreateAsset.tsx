import { useState } from "react";
import { createAsset } from "@/api/assetApi";
import { Asset } from "@/types/asset";

const CreateAsset = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const handleCreate = async () => {
    if (!image) {
      console.warn("⚠️ No image selected.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const response = await createAsset(formData);
      console.log("✅ New Asset Created:", response);
    } catch (error) {
      console.error("❌ Asset Creation Failed:", error);
    }
  };

  return (
    <div>
      <h2>Create New Asset</h2>
      <input
        type="text"
        placeholder="Asset name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Asset description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <br />
      <button onClick={handleCreate}>Create Asset</button>
    </div>
  );
};

export default CreateAsset;
