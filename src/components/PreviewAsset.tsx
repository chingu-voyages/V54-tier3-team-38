// src/components/PreviewAsset.tsx
import { useAssets } from '@/hooks/useAssets'; // or wherever your hook lives

const PreviewAsset = () => {
  const { assets, isLoading, error } = useAssets();

  if (isLoading) return <p>Loading assets...</p>;
  if (error) return <p>Error loading assets!</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assets.map((asset) => (
        <div key={asset.id} className="p-4 border rounded">
          <img
            src={asset.image}
            alt={asset.name}
            className="rounded-md max-w-full md:max-w-md"
          />
          <p className="font-bold">{asset.name}</p>
          <p>{asset.description}</p>
        </div>
      ))}
    </div>
  );
};

export default PreviewAsset;
