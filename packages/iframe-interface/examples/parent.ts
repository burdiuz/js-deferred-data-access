import { initializeParent } from '@actualwave/iframe-interface';

// ---------------------------------------------------------------------------
// Parent page — HOST that exposes an API to the embedded iframe
// ---------------------------------------------------------------------------

const iframe = document.getElementById('sandbox') as HTMLIFrameElement;

// API exposed to the iframe
const hostApi = {
  user: {
    id:   1,
    name: 'Alice',
    role: 'admin',
  },
  theme: {
    get()          { return localStorage.getItem('theme') ?? 'light'; },
    set(t: string) { localStorage.setItem('theme', t); },
  },
  navigate(path: string) {
    window.history.pushState(null, '', path);
  },
};

const { root: iframeApi, stop } = await initializeParent({
  iframe,
  origin: 'https://widget.example.com',
  root:   hostApi,
  handshakeTimeout: 5_000,
});

// `iframeApi` is a proxy to whatever API the iframe exported via initializeIframe()
const remoteApi = iframeApi as any;
const widgetData = await remoteApi.getData();
console.log('Widget returned:', widgetData);

window.addEventListener('beforeunload', stop);
