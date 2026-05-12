/**
 * React Native side (HOST) — TypeScript example
 *
 * Pair this with the WebView side below. The HOST exposes a native API;
 * the GUEST exposes a page API. Both sides can call each other.
 */

import { initializeHost, WebViewRef } from '@actualwave/webview-interface';

// --- Types shared between host and guest ---

type NativeApi = {
  getConfig(): { theme: 'light' | 'dark'; fontSize: number };
  saveFile(path: string, content: string): Promise<boolean>;
  showAlert(title: string, message: string): void;
};

type PageApi = {
  setContent(code: string): void;
  getContent(): string;
  setCursorPosition(line: number, col: number): void;
};

// --- React Native component (simplified, no JSX) ---

let webViewRef: WebViewRef | null = null; // set by React ref callback
let onMessageHandler: ((event: { nativeEvent: { data: string } }) => void) | null = null;

// Call this after the WebView ref is populated (e.g., in useEffect or componentDidMount)
async function setupBridge() {
  if (!webViewRef) throw new Error('WebView not mounted');

  const nativeApi: NativeApi = {
    getConfig: () => ({ theme: 'dark', fontSize: 14 }),
    saveFile: async (path, content) => {
      console.log(`[RN] Saving ${path} (${content.length} chars)`);
      return true;
    },
    showAlert: (title, message) => {
      console.log(`[RN] Alert: ${title} — ${message}`);
    },
  };

  // initializeHost returns SYNCHRONOUSLY — onMessage is immediately available
  const { onMessage, connection } = initializeHost({
    webView: webViewRef,
    root: nativeApi,
    handshakeTimeout: 10_000,
    responseTimeout: 5_000,
  });

  // Wire the message handler (e.g., pass to <WebView onMessage={onMessageHandler}/>)
  onMessageHandler = onMessage;

  const { root: pageApi, stop } = (await connection) as unknown as {
    root: PageApi;
    stop: () => void;
  };

  // Now call methods on the WebView page
  await pageApi.setContent('function hello() {\n  return 42;\n}');
  const content = await pageApi.getContent();
  console.log('[RN] Editor content:', content);

  await pageApi.setCursorPosition(1, 0);
  console.log('[RN] Cursor moved to line 1');

  return stop;
}

// --- WebView side (GUEST) ---

import { initializeGuest } from '@actualwave/webview-interface';

async function initEditor() {
  let editorContent = '';

  const pageApi: PageApi = {
    setContent(code) {
      editorContent = code;
      console.log('[WebView] Content set:', code.slice(0, 40));
    },
    getContent() {
      return editorContent;
    },
    setCursorPosition(line, col) {
      console.log(`[WebView] Cursor: line=${line} col=${col}`);
    },
  };

  // initializeGuest throws if ReactNativeWebView is not present
  const { root: nativeApi, stop } = (await initializeGuest({
    root: pageApi,
    handshakeTimeout: 10_000,
    responseTimeout: 5_000,
  })) as unknown as { root: NativeApi; stop: () => void };

  // Call React Native methods
  const config = await nativeApi.getConfig();
  console.log('[WebView] Config from RN:', config);

  const saved = await nativeApi.saveFile('/editor/main.ts', editorContent);
  console.log('[WebView] Save result:', saved);

  nativeApi.showAlert('Ready', 'Editor initialised successfully');

  return stop;
}
