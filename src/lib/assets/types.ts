export type StudioAssetStatus = "ACTIVE" | "ORPHANED" | "DELETED";

export type MediaAssetOption = {
  id: string;
  url: string;
  altText: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  originalName: string | null;
};

export type AssetUsageSummary = {
  draft: string[];
  published: string[];
};

export type StudioMediaAsset = MediaAssetOption & {
  provider: "CLOUDINARY";
  status: StudioAssetStatus;
  publicId: string;
  resourceType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  usage: AssetUsageSummary;
};
