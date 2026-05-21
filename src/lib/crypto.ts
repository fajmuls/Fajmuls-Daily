import CryptoJS from 'crypto-js';

const PREFIX = 'ENC:';

export const encryptText = (text: string, secret: string) => {
  if (!text) return text;
  // If it's already encrypted, don't encrypt again
  if (text.startsWith(PREFIX)) return text;
  
  const cipher = CryptoJS.AES.encrypt(text, secret).toString();
  return PREFIX + cipher;
};

export const decryptText = (text: string, secret: string) => {
  if (!text) return text;
  if (!text.startsWith(PREFIX)) return text;
  
  try {
    const cipher = text.substring(PREFIX.length);
    const bytes = CryptoJS.AES.decrypt(cipher, secret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails due to wrong key, it might return empty string
    if (!decrypted) return text; // Return original if fail
    return decrypted;
  } catch (err) {
    return text;
  }
};
