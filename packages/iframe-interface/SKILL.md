---
name: "iframe-interface"
description: "Bidirectional DDA RPC between a parent page and an embedded iframe via postMessage. Use when wiring cross-origin or same-origin parent-iframe communication, exposing APIs to an iframe, or calling back into the parent from iframe code."
license: "MIT"
compatibility: "Browser. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/iframe-interface"
---

# @actualwave/iframe-interface

Wraps `window.postMessage` / `message` event into a DDA `initialize()` channel between a parent page and an iframe.

## Key exports

```typescript
import { initializeParent, initializeIframe } from '@actualwave/iframe-interface';
```

## Pattern

```typescript
// Parent (HOST)
const { root: iframeApi, stop } = await initializeParent({
  iframe: iframeEl,
  origin: 'https://embedded.example.com',
  root: { getTheme: () => 'dark' },
});
const title = await iframeApi.getTitle();

// Iframe (GUEST)
const { root: parentApi, stop } = await initializeIframe({
  origin: 'https://host.example.com',
  root: { getTitle: () => document.title },
});
const theme = await parentApi.getTheme();
```

## Config options

Both functions accept the same shape (`ParentConfig` / `IframeConfig`):

| Field | Description |
|---|---|
| `iframe` | `HTMLIFrameElement` (parent only) |
| `origin?` | Passed to `postMessage` as `targetOrigin`; also filters incoming messages. Default `'*'`. |
| `root?` | API to expose to the other side |
| `handshakeTimeout?` | ms |
| `responseTimeout?` | ms |

## Transport internals

- **Parent → iframe**: `iframe.contentWindow.postMessage(data, origin)`.
- **Iframe → parent**: `window.parent.postMessage(data, origin)`.
- `preprocessResponse` extracts `event.data`; origin filtering is applied first.

## Security

Always pass an explicit `origin` (not `'*'`) when the channel carries sensitive data. Messages from unexpected origins are dropped silently.
