// src/components/AssetsHandler.tsx
import React from 'react';
import { useAssets } from '@/hooks/useAssets';

const AssetsHandler = () => {
  const { assets, isLoading, error } = useAssets();

  if (isLoading) return <p>Loading assets...</p>;
  if (error) return <p>Error loading assets.</p>;

  return (
    <div>
      {assets.map((asset) => (
        <div key={asset.id}>
          <img src={asset.image} alt={asset.name} className="max-w-xs rounded" />
          <h3>{asset.name}</h3>
          <p>{asset.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AssetsHandler;
