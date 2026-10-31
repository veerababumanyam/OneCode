import type { DesktopApi } from "../api/types";
import { en } from "../i18n/en";
import { devEn } from "../i18n/dev-en";

export function createDevelopmentFixtureAdapter(): DesktopApi {
  return {
    async loadWorkspace() {
      return {
        kind: "development-fixture",
        projectName: en.app.noWorkspace,
        activeSession: en.app.noSession,
        notice: devEn.fixtureNotice,
      };
    },
    async previewRequest(text) {
      return {
        kind: "local-preview",
        text,
        notice: en.companion.localPreviewNotice,
      };
    },
  };
}
