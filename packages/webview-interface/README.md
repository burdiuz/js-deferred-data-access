# @actualwave/webview-interface

Bidirectional DDA RPC between a React Native host and a WebView over the asymmetric
`injectJavaScript` / `ReactNativeWebView.postMessage` transport.

## Why a dedicated package?

React Native WebView communication is **asymmetric**:

| Direction | Mechanism |
|---|---|
| React Native → WebView | `webViewRef.injectJavaScript(script)` — runs JavaScript in the page |
| WebView → React Native | `window.ReactNativeWebView.postMessage(string)` → `<WebView onMessage>` prop |

Both sides are wired into DDA's `initialize()` automatically; you only need to pass the
`webView` ref and an optional `root` API object.

## Installation

```bash
npm install @actualwave/webview-interface
```

## React Native side (HOST)

`initializeHost` returns **synchronously** so `onMessage` is available before the first message
arrives. The `connection` promise resolves after the DDA handshake completes.

```tsx
import { useRef, useCallback, useEffect } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { initializeHost } from '@actualwave/webview-interface';

export default function EditorScreen() {
  const webViewRef = useRef(null);
  const onMessageRef = useRef<((e: WebViewMessageEvent) => void) | null>(null);

  // Stable handler forwarded to the WebView — never changes reference
  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    onMessageRef.current?.(e);
  }, []);

  useEffect(() => {
    if (!webViewRef.current) return;

    const { onMessage, connection } = initializeHost({
      webView: webViewRef.current,
      root: {
        getConfig: () => ({ theme: 'dark', fontSize: 14 }),
        saveFile: (content: string) => { /* persist */ },
      },
    });

    onMessageRef.current = onMessage;

    connection.then(({ root: webApi, stop }) => {
      // call methods on the WebView page
      webApi.setContent('console.log("hello")');

      return () => {
        onMessageRef.current = null;
        stop();
      };
    });
  }, []);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'https://example.com/editor' }}
      onMessage={handleMessage}
    />
  );
}
```

## WebView side (GUEST)

```typescript
import { initializeGuest } from '@actualwave/webview-interface';

const { root: nativeApi, stop } = await initializeGuest({
  root: {
    setContent(code: string) {
      editor.setValue(code);
    },
    getContent() {
      return editor.getValue();
    },
  },
});

// Call methods on React Native
const config = await nativeApi.getConfig();
editor.setTheme(config.theme);
```

## API

### `initializeHost(config): WebViewHostHandle`

Returns synchronously. Kicks off the DDA handshake in the background.

| Property | Type | Description |
|---|---|---|
| `config.webView` | `{ injectJavaScript(s: string): void }` | The React Native WebView ref (must be mounted). |
| `config.root` | `unknown` | Optional API object to expose to the WebView. |
| `config.handshakeTimeout` | `number` | Ms to wait for the GUEST handshake (default: no timeout). |
| `config.responseTimeout` | `number` | Ms before a remote call times out (default: no timeout). |

**Returns** `{ onMessage, connection }`:

- `onMessage(event)` — pass to `<WebView onMessage>`.
- `connection` — `Promise` resolving to `{ root, stop, pool, wrap, pendingRequests }`.

### `initializeGuest(config?): Promise<InitializeResult>`

Must run inside a React Native WebView where `window.ReactNativeWebView` is injected.
Throws synchronously if called outside a WebView context.

| Property | Type | Description |
|---|---|---|
| `config.root` | `unknown` | Optional API object to expose to React Native. |
| `config.handshakeTimeout` | `number` | Ms to wait for the HOST handshake. |
| `config.responseTimeout` | `number` | Ms before a remote call times out. |

**Returns** `Promise<{ root, stop, pool, wrap, pendingRequests }>`.

## Transport details

- **HOST → GUEST**: Serialises the DDA message with `JSON.stringify` twice (once for the payload,
  once for the JS string literal), then injects:
  ```js
  window.dispatchEvent(new MessageEvent('message', { data: "<json>" }));true;
  ```
- **GUEST → HOST**: `window.ReactNativeWebView.postMessage(JSON.stringify(data))`, received via
  `<WebView onMessage>` where `event.nativeEvent.data` holds the string.
- **Preprocessing**: Both sides parse the nested JSON automatically.
