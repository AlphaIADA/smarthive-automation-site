export type ConfigurationCategory =
  | "lighting"
  | "security"
  | "hvac"
  | "curtains"
  | "audio"
  | "network"
  | "solar"
  | "power"
  | "pool"
  | "garden"
  | "garage";

export type ConfigurationPackageId = "basic" | "standard" | "premium" | "luxury" | "ultra-luxury";
export type ConfigurationItemSource = "smart-device" | "security-device" | "lighting" | "switch" | "socket" | "energy-recommendation";
export type ConfigurationExportType = "proposal" | "pdf" | "images" | "device-list" | "installation-plan" | "bill-of-materials";
export type ConfigurationCrmLeadStatus = "new" | "assigned" | "proposal-ready" | "follow-up" | "won" | "lost";

export interface ConfigurationPricing {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly currency: "USD";
}

export interface ConfigurationRenderSpec {
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number, number];
  readonly color: string;
  readonly visibility: boolean;
  readonly lod: "near" | "mid" | "far";
  readonly collision: boolean;
  readonly shadow: boolean;
}

export interface ConfigurationItem {
  readonly id: string;
  readonly name: string;
  readonly category: ConfigurationCategory;
  readonly source: ConfigurationItemSource;
  readonly sourceId: string;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly manufacturer: string;
  readonly model: string;
  readonly description: string;
  readonly pricing: ConfigurationPricing;
  readonly packageRank: 1 | 2 | 3 | 4 | 5;
  readonly selectable: true;
  readonly render: ConfigurationRenderSpec | null;
}

export interface ConfigurationPackage {
  readonly id: ConfigurationPackageId;
  readonly name: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly description: string;
  readonly discountPercent: number;
  readonly categoryCoverage: readonly ConfigurationCategory[];
  readonly itemIds: readonly string[];
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly taxCost: number;
  readonly discountAmount: number;
  readonly grandTotal: number;
}

export interface ConfigurationCostSummary {
  readonly selectedItemCount: number;
  readonly packageId: ConfigurationPackageId;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly taxRate: number;
  readonly taxCost: number;
  readonly discountPercent: number;
  readonly discountAmount: number;
  readonly grandTotal: number;
  readonly currency: "USD";
}

export interface ConfigurationDesignSnapshot {
  readonly id: string;
  readonly name: string;
  readonly packageId: ConfigurationPackageId;
  readonly selectedItemIds: readonly string[];
  readonly selectedItemCount: number;
  readonly costSummary: ConfigurationCostSummary;
  readonly customerAccountReady: true;
  readonly loadLaterReady: true;
  readonly shareToken: string;
  readonly shareUrl: string;
  readonly savedAtLabel: string;
  readonly persistence: "local-serializable-payload";
}

export interface ConfigurationExportArtifact {
  readonly id: string;
  readonly type: ConfigurationExportType;
  readonly title: string;
  readonly description: string;
  readonly itemCount: number;
  readonly ready: true;
  readonly existingPdfEngineModified: false;
}

export interface ConfigurationProposal {
  readonly id: string;
  readonly title: string;
  readonly packageId: ConfigurationPackageId;
  readonly sections: readonly string[];
  readonly exports: readonly ConfigurationExportArtifact[];
  readonly designSnapshot: ConfigurationDesignSnapshot;
  readonly costSummary: ConfigurationCostSummary;
  readonly professionalProposalReady: true;
}

export interface ConfigurationCrmLeadPayload {
  readonly id: string;
  readonly customerName: string;
  readonly source: "experience-configurator";
  readonly packageId: ConfigurationPackageId;
  readonly estimatedValue: number;
  readonly selectedItemCount: number;
  readonly assignedSalesStaff: string;
  readonly status: ConfigurationCrmLeadStatus;
  readonly nextAction: string;
  readonly crmIntegrationReady: true;
  readonly existingCrmModified: false;
  readonly apiModified: false;
  readonly databaseModified: false;
}

export interface ConfigurationReport {
  readonly itemCount: number;
  readonly packageCount: number;
  readonly categoryCount: number;
  readonly selectableDeviceCount: number;
  readonly defaultCostSummary: ConfigurationCostSummary;
  readonly packageComparison: readonly ConfigurationPackage[];
  readonly exportArtifacts: readonly ConfigurationExportArtifact[];
  readonly crmLeadPayload: ConfigurationCrmLeadPayload;
  readonly capabilities: {
    readonly walkThroughConfigurator: true;
    readonly clickDevicesToConfigure: true;
    readonly realTimeCosting: true;
    readonly packageComparison: true;
    readonly saveDesignPayload: true;
    readonly sharePayload: true;
    readonly exportPayloads: true;
    readonly proposalReady: true;
    readonly crmLeadPayloadReady: true;
  };
  readonly constraints: {
    readonly customerAccountSystem: "payload-only";
    readonly externalPdfEngine: "untouched";
    readonly externalCrm: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
  };
}
