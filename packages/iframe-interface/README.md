# iframe-interface

Bidirectional DDA proxy channel between a parent page and an embedded iframe using `postMessage`, with optional origin validation.

## Installation

```bash
npm install @actualwave/iframe-interface
```

## Usage

### Parent page

```typescript
import { initializeParent } from '@actualwave/iframe-interface';

const iframe = document.getElementById('my-iframe') as HTMLIFrameElement;

const { root, stop } = await initializeParent({
  iframe,
  origin: 'https://embedded.example.com', // optional, defaults to '*'
  root: { getTheme: () => 'dark' },        // API to expose to the iframe
});

// root is a proxy to the iframe's exported API
const title = await root.getTitle();
```

### Iframe

```typescript
import { initializeIframe } from '@actualwave/iframe-interface';

const { root } = await initializeIframe({
  origin: 'https://host.example.com', // optional, validates incoming messages
  root: { getTitle: () => document.title },
});

const theme = await root.getTheme();
```

## API

### `initializeParent(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `iframe` | `HTMLIFrameElement` | required | The iframe element to communicate with |
| `origin` | `string` | `'*'` | Target origin for `postMessage`; also filters incoming messages |
| `root` | `unknown` | — | Object to expose to the iframe |
| `id` | `string` | auto | Stable endpoint ID |
| `handshakeTimeout` | `number` | — | ms before handshake times out |
| `responseTimeout` | `number` | — | ms before a remote call times out |
| `preprocessResponse` | `(data) => unknown` | identity | Additional transform applied after origin validation |

### `initializeIframe(config)`

Same options as `initializeParent`, minus `iframe`.

## Security

Always pass an explicit `origin` (not `'*'`) when communicating sensitive data cross-origin. Incoming messages from other origins are silently dropped.
