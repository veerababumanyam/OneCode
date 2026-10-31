import type { DesktopApi } from "./types";
import { en } from "../i18n/en";

export async function createDesktopApi(): Promise<DesktopApi> {
  if (import.meta.env.DEV) {
    const { createDevelopmentFixtureAdapter } = await import("../dev/fixture-adapter");
    return createDevelopmentFixtureAdapter();
  }

  return {
    async loadWorkspace() {
      return { kind: "unavailable", message: en.app.runtimeMessage };
    },
    async previewRequest() {
      return { kind: "unavailable", message: en.app.runtimeMessage };
    },
  };
}
