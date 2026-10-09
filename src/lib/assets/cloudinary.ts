import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { isCloudinaryPortfolioImageSource } from "@/lib/content/schema";

let configured = false;

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getCloudinaryClient() {
  if (!configured) {
    cloudinary.config({
      cloud_name: getCloudinaryCloudName(),
      api_key: requiredEnvironmentValue("CLOUDINARY_API_KEY"),
      api_secret: requiredEnvironmentValue("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

function getCloudinaryCloudName(): string {
  const cloudName = requiredEnvironmentValue("CLOUDINARY_CLOUD_NAME");

  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
    throw new Error("CLOUDINARY_CLOUD_NAME contains unsupported characters.");
  }

  return cloudName;
}

export function isConfiguredCloudinaryImageUrl(value: string): boolean {
  if (!isCloudinaryPortfolioImageSource(value)) {
    return false;
  }

  const url = new URL(value);
  return url.pathname.split("/")[1] === getCloudinaryCloudName();
}

function getUploadFolder(): string {
  const folder = requiredEnvironmentValue("CLOUDINARY_UPLOAD_FOLDER")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  if (!folder || !/^[a-zA-Z0-9/_-]+$/.test(folder)) {
    throw new Error("CLOUDINARY_UPLOAD_FOLDER contains unsupported characters.");
  }

  return folder;
}

export function uploadPortfolioImage(buffer: Buffer): Promise<UploadApiResponse> {
  const client = getCloudinaryClient();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        resource_type: "image",
        type: "upload",
        folder: getUploadFolder(),
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        tags: ["portfolio-studio"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary did not return an upload result."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

/** Removes only a just-uploaded file when its database transaction fails. */
export async function rollbackUnrecordedPortfolioUpload(publicId: string): Promise<void> {
  await getCloudinaryClient().uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
    invalidate: true,
  });
}
