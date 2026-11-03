import { Wallet } from 'ethers';
import { EthAddress } from '@ethersphere/bee-js';
import { PublisherIdentity } from '../types/swarm';

let inMemoryPrivateKey: string | null = null;
let inMemoryAddress: string | null = null;

const SESSION_STORAGE_KEY = 'freepress_session_identity';

export function generateRandomPrivateKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis !== 'undefined' && (globalThis as any).crypto?.getRandomValues) {
    (globalThis as any).crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function createNewPublisherIdentity(): PublisherIdentity {
  const privateKey = generateRandomPrivateKey();
  const wallet = new Wallet(privateKey);
  inMemoryPrivateKey = wallet.privateKey;
  inMemoryAddress = wallet.address.toLowerCase();

  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ address: inMemoryAddress, privateKey: inMemoryPrivateKey })
    );
  } catch {
    // Ignore
  }

  return {
    address: inMemoryAddress,
    privateKey: inMemoryPrivateKey,
    isUnlocked: true,
  };
}

export function importPublisherIdentity(rawPrivateKey: string): PublisherIdentity {
  let cleanKey = rawPrivateKey.trim();
  if (!cleanKey.startsWith('0x')) {
    cleanKey = `0x${cleanKey}`;
  }

  if (cleanKey.length !== 66 || !/^0x[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('Invalid private key format: Expected 32-byte hex string (64 hex characters)');
  }

  const wallet = new Wallet(cleanKey);
  inMemoryPrivateKey = wallet.privateKey;
  inMemoryAddress = wallet.address.toLowerCase();

  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ address: inMemoryAddress, privateKey: inMemoryPrivateKey })
    );
  } catch {
    // Ignore
  }

  return {
    address: inMemoryAddress,
    privateKey: inMemoryPrivateKey,
    isUnlocked: true,
  };
}

export function getActivePublisherIdentity(): PublisherIdentity | null {
  if (inMemoryPrivateKey !== null && inMemoryAddress !== null) {
    const addr = inMemoryAddress;
    const pk = inMemoryPrivateKey;
    return {
      address: addr,
      privateKey: pk,
      isUnlocked: true,
    };
  }

  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.privateKey && parsed.address) {
        inMemoryPrivateKey = parsed.privateKey;
        inMemoryAddress = parsed.address;
        return {
          address: parsed.address,
          privateKey: parsed.privateKey,
          isUnlocked: true,
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export function lockPublisherIdentity(): void {
  inMemoryPrivateKey = null;
  inMemoryAddress = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function deriveEthAddress(addressOrKey: string): EthAddress {
  let addr = addressOrKey.trim();
  if (addr.length === 64 || addr.length === 66) {
    const cleanKey = addr.startsWith('0x') ? addr : `0x${addr}`;
    const wallet = new Wallet(cleanKey);
    addr = wallet.address;
  }
  const cleanAddr = addr.replace(/^0x/, '');
  return new EthAddress(cleanAddr);
}
