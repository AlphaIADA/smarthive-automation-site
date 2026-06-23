import { AnimationManager } from "@/components/experience/managers/animation-manager";
import { AssetManager } from "@/components/experience/managers/asset-manager";
import { AudioManager } from "@/components/experience/managers/audio-manager";
import { AutomationManager } from "@/components/experience/managers/automation-manager";
import { CameraManager } from "@/components/experience/managers/camera-manager";
import { DebugManager } from "@/components/experience/managers/debug-manager";
import { DeviceManager } from "@/components/experience/managers/device-manager";
import { EffectsManager } from "@/components/experience/managers/effects-manager";
import { EnvironmentManager } from "@/components/experience/managers/environment-manager";
import { ExperienceManager } from "@/components/experience/managers/experience-manager";
import { InputManager } from "@/components/experience/managers/input-manager";
import { LightingManager } from "@/components/experience/managers/lighting-manager";
import { LoadingManager } from "@/components/experience/managers/loading-manager";
import { LODManager } from "@/components/experience/managers/lod-manager";
import { MaterialManager } from "@/components/experience/managers/material-manager";
import { MemoryManager } from "@/components/experience/managers/memory-manager";
import { NotificationManager } from "@/components/experience/managers/notification-manager";
import { PerformanceManager } from "@/components/experience/managers/performance-manager";
import { PhysicsManager } from "@/components/experience/managers/physics-manager";
import { PluginManager } from "@/components/experience/managers/plugin-manager";
import { SceneManager } from "@/components/experience/managers/scene-manager";
import { ScenePresetManager } from "@/components/experience/managers/scene-preset-manager";
import { SelectionManager } from "@/components/experience/managers/selection-manager";
import { ThemeManager } from "@/components/experience/managers/theme-manager";
import { FUTURE_PLUGINS } from "@/components/experience/plugins/future-plugins";
import type { ManagerPublicApi } from "@/types/experience";
import { EventBus } from "./event-bus";
import { toExperienceError } from "./errors";
import { PluginRegistry } from "./plugin-registry";

export class ExperienceRuntime {
  readonly eventBus = new EventBus();
  readonly pluginRegistry = new PluginRegistry(this.eventBus);
  readonly managers: readonly ManagerPublicApi[];
  private started = false;
  private consumers = 0;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const context = { eventBus: this.eventBus };
    this.managers = [
      new ExperienceManager(context),
      new SceneManager(context),
      new LightingManager(context),
      new EnvironmentManager(context),
      new MaterialManager(context),
      new AssetManager(context),
      new AnimationManager(context),
      new CameraManager(context),
      new InputManager(context),
      new SelectionManager(context),
      new PhysicsManager(context),
      new DeviceManager(context),
      new AutomationManager(context),
      new ScenePresetManager(context),
      new NotificationManager(context),
      new PerformanceManager(context),
      new LODManager(context),
      new MemoryManager(context),
      new PluginManager(context),
      new ThemeManager(context),
      new AudioManager(context),
      new EffectsManager(context),
      new DebugManager(context),
      new LoadingManager(context),
    ];
  }

  acquire(): void {
    this.consumers += 1;
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    void this.start();
  }

  release(): void {
    this.consumers = Math.max(0, this.consumers - 1);
    if (this.consumers > 0 || this.stopTimer) return;
    this.stopTimer = setTimeout(() => {
      this.stopTimer = null;
      if (this.consumers === 0) void this.stop();
    }, 0);
  }

  async start(): Promise<void> {
    if (this.started) return;
    try {
      this.started = true;
      this.eventBus.emit("LOADING_CHANGED", {
        loading: true,
        progress: 10,
        label: "Starting experience runtime",
      });
      await Promise.all(this.managers.map((manager) => manager.initialize()));
      const pluginCount = this.pluginRegistry.registerAll(FUTURE_PLUGINS);
      this.eventBus.emit("LOADING_CHANGED", {
        loading: false,
        progress: 100,
        label: "Experience ready",
      });
      this.eventBus.emit("EXPERIENCE_READY", {
        managerCount: this.managers.length,
        pluginCount,
      });
    } catch (error) {
      this.started = false;
      const typedError = toExperienceError(error, "RUNTIME_START_FAILED", "ExperienceRuntime");
      this.eventBus.emit("MANAGER_ERROR", {
        manager: typedError.manager,
        code: typedError.code,
        message: typedError.message,
      });
    }
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    try {
      await Promise.all([...this.managers].reverse().map((manager) => manager.dispose()));
      this.pluginRegistry.dispose();
      this.eventBus.emit("EXPERIENCE_DISPOSED", { timestamp: Date.now() });
      this.eventBus.clear();
      this.started = false;
    } catch (error) {
      const typedError = toExperienceError(error, "RUNTIME_STOP_FAILED", "ExperienceRuntime");
      this.eventBus.emit("MANAGER_ERROR", {
        manager: typedError.manager,
        code: typedError.code,
        message: typedError.message,
      });
    }
  }
}

let runtime: ExperienceRuntime | null = null;

export function getExperienceRuntime(): ExperienceRuntime {
  if (!runtime) runtime = new ExperienceRuntime();
  return runtime;
}
