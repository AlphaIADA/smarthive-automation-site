import { BaseManager } from "@/lib/experience/base-manager";
import type { ManagerContext } from "@/types/experience";

export class AssetManager extends BaseManager {
  private readonly requestedAssets = new Map<string, string>();

  constructor(context: ManagerContext) {
    super("AssetManager", context);
  }

  getRequestedAssets(): ReadonlyMap<string, string> {
    return this.requestedAssets;
  }

  request(assetId: string, url: string): void {
    this.emit("ASSET_REQUESTED", { assetId, url });
  }

  protected onInitialize(): void {
    try {
      this.subscribe("ASSET_REQUESTED", ({ assetId, url }) => {
        this.requestedAssets.set(assetId, url);
      });
    } catch (error) {
      this.degrade(error, "MANAGER_INITIALIZATION_FAILED");
    }
  }
}
