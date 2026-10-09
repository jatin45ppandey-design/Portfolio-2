import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isConfiguredCloudinaryImageUrl,
  rollbackUnrecordedPortfolioUpload,
  uploadPortfolioImage,
} from "@/lib/assets/cloudinary";
import { requireAssetOwnerActor } from "@/lib/assets/owner";
import { createUploadedCloudinaryAsset } from "@/lib/assets/repository";
import {
  UploadValidationError,
  validatePortfolioImageUpload,
  validatePortfolioImageUploadMetadata,
} from "@/lib/assets/upload-validation";

export const runtime = "nodejs";

const AltTextSchema = z.string().trim().min(1).max(240);

export async function POST(request: Request) {
  const actor = await requireAssetOwnerActor();
  let uploadedPublicId: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const parsedAltText = AltTextSchema.safeParse(formData.get("altText"));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }

    if (!parsedAltText.success) {
      return NextResponse.json(
        { error: "Enter descriptive alt text up to 240 characters." },
        { status: 400 },
      );
    }

    validatePortfolioImageUploadMetadata({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validatePortfolioImageUpload({
      name: file.name,
      type: file.type,
      size: file.size,
      bytes,
    });
    const uploaded = await uploadPortfolioImage(Buffer.from(bytes));
    uploadedPublicId = uploaded.public_id;

    if (
      uploaded.resource_type !== "image" ||
      !uploaded.public_id ||
      !isConfiguredCloudinaryImageUrl(uploaded.secure_url)
    ) {
      throw new Error("Cloudinary returned an invalid portfolio image response.");
    }

    const asset = await createUploadedCloudinaryAsset(
      {
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        resourceType: uploaded.resource_type,
        format: uploaded.format || null,
        width: Number.isSafeInteger(uploaded.width) ? uploaded.width : null,
        height: Number.isSafeInteger(uploaded.height) ? uploaded.height : null,
        bytes: Number.isSafeInteger(uploaded.bytes) ? uploaded.bytes : null,
        originalName: validated.originalName,
        altText: parsedAltText.data,
      },
      actor,
    );

    uploadedPublicId = null;
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await rollbackUnrecordedPortfolioUpload(uploadedPublicId);
      } catch {
        // The original failure is returned; Cloudinary cleanup can be handled manually if needed.
      }
    }

    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "The image could not be uploaded." }, { status: 500 });
  }
}
