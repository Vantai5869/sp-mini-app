export {};

// Injected by the supper-app host (see lib/miniAppBridge.ts there) before
// this page's own scripts run — only present when loaded inside its
// WebView, not when opened directly in a normal browser.
declare global {
  interface Window {
    MiniApp?: {
      initialData: unknown;
      ready(): Promise<void>;
      call(method: string, params?: unknown): Promise<unknown>;
    };
  }
}

// Result shape of MiniApp.call('openCamera', ...) — one of the interfaces
// the host (supper-app) exposes to every mini app, opening the real native
// camera and returning the captured photo (see MiniAppShell.tsx there).
export type OpenCameraResult = {
  cancelled: boolean;
  uri?: string;
  width?: number;
  height?: number;
  base64?: string | null;
};
