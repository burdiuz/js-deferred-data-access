import { connectMFEInterface } from '@actualwave/mfe-interface';

// ---------------------------------------------------------------------------
// Shell (host) — connects to a microfrontend mounted inside a DOM element
// ---------------------------------------------------------------------------

const mfeRoot = document.getElementById('mfe-checkout') as HTMLElement;

// API the shell exposes to the MFE
const shellApi = {
  auth: {
    user()  { return { id: 42, name: 'Alice', role: 'customer' }; },
    token() { return sessionStorage.getItem('auth_token'); },
  },
  router: {
    navigate(path: string) { window.history.pushState(null, '', path); },
  },
  cart: {
    items() { return JSON.parse(localStorage.getItem('cart') ?? '[]'); },
  },
};

const { root: mfeApi, stop } = await connectMFEInterface({
  element: mfeRoot,
  root: shellApi,
  handshakeTimeout: 3_000,
});

// `mfeApi` is a proxy to whatever the MFE exported in initializeMFEInterface()
const checkout = mfeApi as any;
const summary  = await checkout.getOrderSummary();
console.log('Order total:', summary.total);

window.addEventListener('beforeunload', stop);
