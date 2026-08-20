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
