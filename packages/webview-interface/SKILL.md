---
name: webview-interface
description: >
  Bidirectional DDA RPC between React Native and a WebView over the asymmetric
  injectJavaScript / ReactNativeWebView.postMessage transport. Use this skill when
  working on or integrating @actualwave/webview-interface — wiring the HOST side in
  React Native, the GUEST side inside a WebView page, understanding the double-JSON
  serialisation, or writing tests for this package.
license: MIT
compatibility: >
  React Native (any version with WebView support). WebView page runs in a browser
  context. TypeScript 5+. Tests use Jest 30 + ts-jest. Run `npx jest` from
  packages/webview-interface (requires symlinked or installed node_modules).
metadata:
  author: Oleg Galaburda <burdiuz@gmail.com>
  version: "1.0.0"
  package: "@actualwave/webview-interface"
---

# @actualwave/webview-interface — Agent Skill

## Why this package exists

React Native WebView communication is **asymmetric** — the two directions use entirely
different mechanisms:

| Direction | Mechanism |
|---|---|
| React Native → WebView | `webViewRef.injectJavaScript(script)` — runs JS in the page |
| WebView → React Native | `window.ReactNativeWebView.postMessage(string)` → `<WebView onMessage>` prop |

This package wraps both directions into DDA's standard `initialize()` contract so
both sides get a transparent proxy to the other side's API.

---

## Source layout

```
packages/webview-interface/
├── src/
│   ├── types.ts                — WebViewRef, WebViewMessageEvent, config types, WebViewHostHandle
│   └── webview-interface.ts   — initializeHost(), initializeGuest()
├── index.ts                   — re-exports src/types and src/webview-interface
├── package.json
├── jest.config.js
├── tsconfig.json / tsconfig.lib.json / tsconfig.spec.json / tsconfig.es.json
└── rollup.config.js
```

---

## API

### `initializeHost(config): WebViewHostHandle`

Called on the **React Native side**. Returns **synchronously** so `onMessage` is
available before the WebView page finishes loading.

```typescript
import { initializeHost } from '@actualwave/webview-interface';

const { onMessage, connection } = initializeHost({
  webView: webViewRef.current,   // must expose injectJavaScript(script: string): void
  root: nativeApi,               // optional object to expose to the WebView
  handshakeTimeout: 10_000,
  responseTimeout: 5_000,
});

// Wire immediately — before the page loads
// In JSX: <WebView ref={webViewRef} onMessage={onMessage} … />

const { root: pageApi, stop } = await connection;
await pageApi.setContent('const x = 42;');
```

**`WebViewHostHandle`**

| Field | Type | Description |
|---|---|---|
| `onMessage` | `(event: WebViewMessageEvent) => void` | Pass to `<WebView onMessage>`. Must be set before the WebView page sends its first message. |
| `connection` | `Promise<InitializeResult>` | Resolves after DDA handshake. Provides `root`, `stop`, `pool`, `wrap`, `pendingRequests`. |

**`WebViewHostConfig`** — all `BaseInitConfig` fields except transport callbacks, plus:

| Field | Type | Description |
|---|---|---|
| `webView` | `WebViewRef` | React Native WebView ref — any object with `injectJavaScript(s: string): void`. |
| `root?` | `unknown` | API object to expose to the WebView. |
| `handshakeTimeout?` | `number` | Ms to wait for GUEST handshake ping. |
| `responseTimeout?` | `number` | Ms before a remote call times out. |

---

### `initializeGuest(config?): Promise<InitializeResult>`

Called inside the **WebView page** (browser context). Throws synchronously if
`window.ReactNativeWebView` is not present.

```typescript
import { initializeGuest } from '@actualwave/webview-interface';

const { root: nativeApi, stop } = await initializeGuest({
  root: {
    setContent(code: string) { editor.setValue(code); },
    getContent() { return editor.getValue(); },
  },
  handshakeTimeout: 10_000,
});

const config = await nativeApi.getConfig();
```

**`WebViewGuestConfig`** — same optional fields as `WebViewHostConfig` minus `webView`.

Throws `Error('ReactNativeWebView is not available …')` when called outside a React
Native WebView.

---

## Transport internals

### HOST → GUEST (React Native → WebView)

The payload is JSON-stringified twice — once for the DDA message, once more to produce
a safe JS string literal for injection:

```js
webView.injectJavaScript(
  `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(msg))}}));true;`
);
// trailing ;true; satisfies RN's requirement that injected scripts evaluate truthy
```

### GUEST → HOST (WebView → React Native)

```js
window.ReactNativeWebView.postMessage(JSON.stringify(msg));
// received as event.nativeEvent.data (a string) via <WebView onMessage>
```

`preprocessResponse` on each side calls `JSON.parse` automatically, so DDA sees plain
objects.

---

## React Native integration pattern

Use a stable `ref` + `useCallback` to avoid the WebView re-mounting when `onMessage`
changes reference:

```tsx
import { useRef, useCallback, useEffect } from 'react';
import WebView from 'react-native-webview';
import { initializeHost } from '@actualwave/webview-interface';

export default function EditorScreen() {
  const webViewRef = useRef(null);
  const onMessageRef = useRef(null);

  const handleMessage = useCallback(e => onMessageRef.current?.(e), []);

  useEffect(() => {
    if (!webViewRef.current) return;

    const { onMessage, connection } = initializeHost({
      webView: webViewRef.current,
      root: { getConfig: () => ({ theme: 'dark' }) },
    });

    onMessageRef.current = onMessage;

    let stop;
    connection.then(({ root: pageApi, stop: s }) => {
      stop = s;
      pageApi.setContent('const x = 42;');
    });

    return () => {
      onMessageRef.current = null;
      stop?.();
    };
  }, []);

  return <WebView ref={webViewRef} source={{ uri: '…' }} onMessage={handleMessage} />;
}
```

---

## Testing

```bash
cd packages/webview-interface
npx jest --config jest.config.js
```

`moduleNameMapper` in `jest.config.js` resolves `@actualwave/deferred-data-access/*`
to `packages/deferred-data-access/<sub>/index.ts`.

Mock `@actualwave/deferred-data-access/interface` to isolate from DDA internals:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@actualwave/deferred-data-access/interface', () => ({
  InterfaceType: { HOST: 'host', GUEST: 'guest' },
  initialize: jest.fn(),
}));

const { initialize } = jest.requireMock(
  '@actualwave/deferred-data-access/interface'
) as { initialize: jest.Mock };

// Access captured call arguments:
const args = initialize.mock.calls[0][0] as {
  type: string;
  subscribe: (fn: (e: unknown) => void) => void;
  sendMessage: (data: unknown) => void;
  preprocessResponse: (e: unknown) => unknown;
};
```

Simulate `globalThis.window` for GUEST tests (no DOM in Node):

```typescript
beforeEach(() => {
  (globalThis as any).window = {
    ReactNativeWebView: { postMessage: jest.fn() },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});
afterEach(() => { delete (globalThis as any).window; });
```

---

## Key pitfalls

**`onMessage` must be wired before the first ping** — `initializeHost` is synchronous
so `onMessage` is available immediately. The HOST waits for the GUEST to initiate, and
the GUEST only runs after the page loads, so setting `onMessage` during the same render
that mounts the WebView is always early enough.

**`initializeGuest` uses `globalThis.window`** — not the bare `window` global — so it
works in both browser and Node.js test environments without TypeScript `lib: dom`.

**Double JSON** — HOST double-encodes the payload. `preprocessResponse` on both sides
calls `JSON.parse` once. Do not manually parse the incoming data; `preprocessResponse`
already handles it.

**`WebViewRef` is structural** — only requires `injectJavaScript(s: string): void`.
Any object satisfying that shape works as a test double.
