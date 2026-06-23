export type TextureFormat = "ktx2" | "webp" | "source";

export interface TextureVariant {
  readonly format: TextureFormat;
  readonly url: string;
}

export interface TextureAssetDescriptor {
  readonly id: string;
  readonly variants: readonly TextureVariant[];
}

export interface TextureCapabilities {
  readonly ktx2: boolean;
  readonly webp: boolean;
}

const FORMAT_PRIORITY: readonly TextureFormat[] = ["ktx2", "webp", "source"];

export function resolveTextureVariant(
  descriptor: TextureAssetDescriptor,
  capabilities: TextureCapabilities,
): TextureVariant | null {
  const supportedFormats = FORMAT_PRIORITY.filter((format) =>
    format === "source" || (format === "ktx2" && capabilities.ktx2) || (format === "webp" && capabilities.webp),
  );
  for (const format of supportedFormats) {
    const variant = descriptor.variants.find((candidate) => candidate.format === format);
    if (variant) return variant;
  }
  return null;
}
