"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAssetOwnerActor } from "./owner";
import {
  updateCloudinaryAssetAltText,
  transitionCloudinaryAssetStatus,
} from "./repository";
import {
  AssetReferenceConflictError,
  InvalidAssetStatusTransitionError,
} from "./status-policy";

const UpdateAltTextSchema = z
  .object({
    assetId: z.string().cuid(),
    altText: z.string().trim().min(1).max(240),
  })
  .strict();

const TransitionAssetSchema = z
  .object({
    assetId: z.string().cuid(),
    target: z.enum(["ACTIVE", "ORPHANED", "DELETED"]),
  })
  .strict();

export type AssetActionResult =
  | { ok: true; altText?: string; status?: "ACTIVE" | "ORPHANED" | "DELETED"; deletedAt?: string | null }
  | { ok: false; message: string };

export async function updateAssetAltTextAction(input: unknown): Promise<AssetActionResult> {
  const actor = await requireAssetOwnerActor();
  const parsed = UpdateAltTextSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Enter descriptive alt text up to 240 characters." };
  }

  try {
    const asset = await updateCloudinaryAssetAltText(
      parsed.data.assetId,
      parsed.data.altText,
      actor,
    );
    revalidatePath("/studio/media");
    return { ok: true, altText: asset.altText ?? "" };
  } catch {
    return { ok: false, message: "The asset alt text could not be updated." };
  }
}

export async function transitionAssetStatusAction(input: unknown): Promise<AssetActionResult> {
  const actor = await requireAssetOwnerActor();
  const parsed = TransitionAssetSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "The requested asset status is invalid." };
  }

  try {
    const result = await transitionCloudinaryAssetStatus(
      parsed.data.assetId,
      parsed.data.target,
      actor,
    );
    revalidatePath("/studio/media");
    return { ok: true, ...result };
  } catch (error) {
    if (error instanceof AssetReferenceConflictError) {
      return {
        ok: false,
        message: `Remove this asset from the current draft and published content first: ${error.references.join(", ")}`,
      };
    }

    if (error instanceof InvalidAssetStatusTransitionError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "The asset status could not be updated." };
  }
}
