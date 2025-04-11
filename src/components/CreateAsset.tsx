import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // ✅ include useSelector
import { createAsset } from "@/api/assetApi";
import { Asset } from "@/types/asset";

const CreateAsset = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const dispatch = useDispatch();

  const currentAssets = useSelector((state: any) => state.viewAsset); // ✅ grab current viewAsset

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
      const newAsset = await createAsset(formData);

      // ✅ Dispatch to reducer
      dispatch({ type: "CREATE_ASSET", payload: newAsset });
      dispatch({ type: "VIEW_ASSET", payload: [...currentAssets, newAsset] });

      console.log("✅ New Asset Created:", newAsset);
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
