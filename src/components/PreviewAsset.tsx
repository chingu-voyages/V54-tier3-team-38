import { useSelector } from 'react-redux';
import { Asset } from '@/types/asset';
import DeleteAssetButton from './DeketeAsset';

const PreviewAsset = () => {
  const assets: Asset[] = useSelector((state: any) => state.viewAsset);

  if (!assets.length) return <p>Loading assets...</p>;

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
          <DeleteAssetButton asset={asset} assets={assets} />
        </div>
      ))}
    </div>
  );
};

export default PreviewAsset;
