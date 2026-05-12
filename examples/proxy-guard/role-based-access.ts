import { createGuardedProxy, PermissionError } from '@actualwave/proxy-guard';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

// ---------------------------------------------------------------------------
// Settings API with role-based access control
// ---------------------------------------------------------------------------

interface Settings {
  theme:      string;
  maxRetries: number;
  secretKey:  string;
  reset():    void;
}

const settings: Settings = {
  theme:      'light',
  maxRetries: 3,
  secretKey:  'sk-prod-abc123',
  reset()     { this.theme = 'light'; this.maxRetries = 3; },
};

// Simulate reading the current session role from somewhere
const getRole = async (): Promise<'admin' | 'user' | 'guest'> => 'user';

const guarded = createGuardedProxy(settings, {
  context: getRole,
  defaultPolicy: 'deny',
  rules: [
    // Guests may read only theme
    {
      match: { type: ProxyCommand.GET, name: 'theme' },
      allow: (_cmd, role) => role === 'guest' || role === 'user' || role === 'admin',
    },
    // Users can read theme and maxRetries but not the secret key
    {
      match: { type: ProxyCommand.GET, name: 'maxRetries' },
      allow: (_cmd, role) => role === 'user' || role === 'admin',
    },
    // Only admins may read the secret key
    {
      match: { name: 'secretKey' },
      allow: (_cmd, role) => role === 'admin',
    },
    // Only admins may mutate anything
    {
      match: { type: [ProxyCommand.SET, ProxyCommand.DELETE_PROPERTY, ProxyCommand.METHOD_CALL] },
      allow: (_cmd, role) => role === 'admin',
    },
    // Log every access for audit trail
    {
      before: (cmd, role) => console.log(`[audit] ${role} ${cmd.type} ${cmd.path}`),
      continue: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// User-role reads
// ---------------------------------------------------------------------------

const theme = await (guarded as any).theme;
console.log('Theme:', theme); // 'light'

try {
  await (guarded as any).secretKey;
} catch (e) {
  if (e instanceof PermissionError) {
    console.log('Denied: cannot read secretKey as user'); // expected
  }
}

// ---------------------------------------------------------------------------
// Admin-role: switch context factory to 'admin' for the next guard
// ---------------------------------------------------------------------------

const adminGuard = createGuardedProxy(settings, {
  context: async () => 'admin' as const,
  defaultPolicy: 'deny',
  rules: [
    { allow: true }, // admins pass everything
  ],
});

const key = await (adminGuard as any).secretKey;
console.log('Admin sees key:', key); // 'sk-prod-abc123'

(adminGuard as any).theme = 'dark';
await Promise.resolve();
console.log('Settings theme:', settings.theme); // 'dark'
