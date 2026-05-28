import crypto from 'node:crypto';

// Polyfill global crypto
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  Object.defineProperty(globalThis, 'crypto', {
    value: crypto.webcrypto,
    writable: true,
    configurable: true,
  });
}

// Polyfill the built-in crypto module's default export
if (!crypto.getRandomValues) {
  crypto.getRandomValues = function (array) {
    return crypto.webcrypto.getRandomValues(array);
  };
}

// Now load and run the official Vite CLI
import('./node_modules/vite/bin/vite.js');
