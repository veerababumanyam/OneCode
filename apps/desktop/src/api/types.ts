export type WorkspaceView =
  | "chat"
  | "review"
  | "context"
  | "models"
  | "history"
  | "settings"
  | "explorer"
  | "search"
  | "source-control"
  | "sessions"
  | "knowledge-map";

export type WorkspaceLoadResult =
  | {
      kind: "development-fixture";
      projectName: string;
      activeSession: string;
      notice: string;
    }
  | {
      kind: "unavailable";
      message: string;
    };

export type RequestPreviewResult =
  | {
      kind: "local-preview";
      text: string;
      notice: string;
    }
  | {
      kind: "unavailable";
      message: string;
    };

export interface DesktopApi {
  loadWorkspace(): Promise<WorkspaceLoadResult>;
  previewRequest(text: string): Promise<RequestPreviewResult>;
}
