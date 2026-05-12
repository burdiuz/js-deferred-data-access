import { initializeIframe } from '@actualwave/iframe-interface';

// ---------------------------------------------------------------------------
// Iframe page — GUEST that talks to the parent window
// ---------------------------------------------------------------------------

// API this iframe exposes to the parent
const widgetApi = {
  getData()           { return { items: ['a', 'b', 'c'], total: 3 }; },
  refresh()           { console.log('Widget refreshing...'); },
  setLocale(l: string){ console.log('Locale changed to', l); },
};

const { root: parentApi, stop } = await initializeIframe({
  origin: 'https://app.example.com',
  root:   widgetApi,
  handshakeTimeout: 5_000,
});

// Talk to the parent
const host = parentApi as any;
const user  = await host.user.name;
const theme = await host.theme.get();

console.log(`Hello ${user}, theme is ${theme}`);

await host.theme.set('dark');
await host.navigate('/dashboard');

window.addEventListener('beforeunload', stop);
