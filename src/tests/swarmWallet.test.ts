import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNewPublisherIdentity,
  importPublisherIdentity,
  getActivePublisherIdentity,
  lockPublisherIdentity,
  deriveEthAddress,
  generateRandomPrivateKey,
} from '../services/swarmWallet';
import { Wallet } from 'ethers';

describe('TEST 3: Client-Side Cryptographic Key Management', () => {
  beforeEach(() => {
    lockPublisherIdentity();
  });

  it('generates a fresh publisher identity locally in browser memory', () => {
    const identity = createNewPublisherIdentity();
    expect(identity.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(identity.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(identity.isUnlocked).toBe(true);

    const active = getActivePublisherIdentity();
    expect(active?.address).toBe(identity.address);
  });

  it('imports an existing 32-byte hexadecimal private key locally', () => {
    const rawKey = generateRandomPrivateKey();
    const testWallet = new Wallet(rawKey);
    const imported = importPublisherIdentity(testWallet.privateKey);

    expect(imported.address.toLowerCase()).toBe(testWallet.address.toLowerCase());
    expect(imported.privateKey).toBe(testWallet.privateKey);
  });

  it('rejects invalid or malformed private keys', () => {
    expect(() => importPublisherIdentity('invalid-key')).toThrow();
    expect(() => importPublisherIdentity('0x123')).toThrow();
  });

  it('correctly clears in-memory keys on lock without residual leaks', () => {
    createNewPublisherIdentity();
    expect(getActivePublisherIdentity()).not.toBeNull();

    lockPublisherIdentity();
    expect(getActivePublisherIdentity()).toBeNull();
  });

  it('derives accurate EthAddress instances matching Swarm Single Owner Chunk requirements', () => {
    const rawKey = generateRandomPrivateKey();
    const testWallet = new Wallet(rawKey);
    const derived = deriveEthAddress(testWallet.address);

    expect(derived.toHex().toLowerCase()).toBe(testWallet.address.replace('0x', '').toLowerCase());
  });
});
