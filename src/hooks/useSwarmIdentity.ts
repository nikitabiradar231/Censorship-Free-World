import { useState, useEffect } from 'react';
import { PublisherIdentity } from '../types/swarm';
import {
  getActivePublisherIdentity,
  createNewPublisherIdentity,
  importPublisherIdentity,
  lockPublisherIdentity,
} from '../services/swarmWallet';

export function useSwarmIdentity() {
  const [identity, setIdentity] = useState<PublisherIdentity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const active = getActivePublisherIdentity();
    setIdentity(active);
    setIsLoading(false);
  }, []);

  const generateNew = () => {
    const id = createNewPublisherIdentity();
    setIdentity(id);
    return id;
  };

  const importKey = (rawKey: string) => {
    const id = importPublisherIdentity(rawKey);
    setIdentity(id);
    return id;
  };

  const lock = () => {
    lockPublisherIdentity();
    setIdentity(null);
  };

  return {
    identity,
    isUnlocked: Boolean(identity?.isUnlocked),
    isLoading,
    generateNew,
    importKey,
    lock,
  };
}
