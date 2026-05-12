import { initializeMFEInterface } from '@actualwave/mfe-interface';

// ---------------------------------------------------------------------------
// Microfrontend (guest) — initialises inside its own bundle/entry point
// ---------------------------------------------------------------------------

// Find the root element the shell mounted this MFE into.
const mfeRoot = document.getElementById('mfe-checkout') as HTMLElement;

// API this MFE exposes to the shell
const checkoutApi = {
  getOrderSummary() {
    return { items: 3, total: 149.99, currency: 'USD' };
  },
  confirmOrder() {
    console.log('Order confirmed');
  },
};

const { root: shellApi, stop } = await initializeMFEInterface({
  element: mfeRoot,
  root: checkoutApi,
  handshakeTimeout: 3_000,
});

// Use the shell's services
const shell = shellApi as any;

const user  = await shell.auth.user();
const items = await shell.cart.items();

console.log(`Welcome ${user.name}, you have ${items.length} item(s) in your cart.`);

// Navigate to confirmation after checkout
await shell.router.navigate('/order-confirmed');

window.addEventListener('beforeunload', stop);
