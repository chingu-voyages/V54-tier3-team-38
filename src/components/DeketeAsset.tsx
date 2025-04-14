import { deleteAsset } from "@/api/assetApi";
import { useDispatch } from "react-redux";
import { Asset } from "@/types/asset";

interface Props {
  asset: Asset;
  assets: Asset[];
}

const DeleteAssetButton: React.FC<Props> = ({ asset, assets }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      await deleteAsset(asset.id);
      dispatch({ type: "VIEW_ASSET", payload: assets.filter((a) => a.id !== asset.id) });
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  return (
    <button onClick={handleDelete} style={{ color: "red" }}>
      Delete
    </button>
  );
};

export default DeleteAssetButton;
