
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { getPublicKey, generateSecretKey, nip19 } from "nostr-tools";

// This is what Auth.tsx is looking for
export const createNostrIdentity = () => {
  const sk = generateSecretKey();
  const skHex = bytesToHex(sk);
  const pk = getPublicKey(sk);
  
  localStorage.setItem("nostr_sk", skHex);
  return { sk, pk, skHex };
};

export const getNostrIdentity = () => {
  const skHex = localStorage.getItem("nostr_sk");
  if (!skHex) return null;
  
  try {
    const sk = hexToBytes(skHex);
    const pk = getPublicKey(sk);
    return { sk, pk, skHex };
  } catch (e) {
    console.error("Invalid key in storage", e);
    return null;
  }
};

export const loginWithPrivateKey = (nsec: string) => {
  try {
    const { type, data } = nip19.decode(nsec);
    if (type !== 'nsec') {
      throw new Error("Invalid key type. Expected 'nsec'.");
    }
    const sk = data as Uint8Array;
    const skHex = bytesToHex(sk);
    const pk = getPublicKey(sk);

    localStorage.setItem("nostr_sk", skHex);
    return { sk, pk, skHex };
  } catch (e) {
    console.error("Failed to login with private key", e);
    return null;
  }
};
