import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATION = 65535;
const ENCRYPTED_POSITION = SALT_LENGTH + IV_LENGTH;

export default class AesEncrypt {
  constructor(private readonly secret: string) {}

  private getKey(salt: Buffer) {
    return crypto.pbkdf2Sync(
      this.secret,
      salt,
      ITERATION,
      KEY_LENGTH,
      "sha512"
    );
  }

  public encrypt(plainText: string) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = this.getKey(salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(String(plainText), "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, encrypted, tag]).toString("base64");
  }

  public decrypt(cipherText: string) {
    const stringValue = Buffer.from(String(cipherText), "base64");

    const salt = stringValue.subarray(0, SALT_LENGTH);
    const iv = stringValue.subarray(SALT_LENGTH, ENCRYPTED_POSITION);
    const encrypted = stringValue.subarray(
      ENCRYPTED_POSITION,
      stringValue.length - TAG_LENGTH
    );
    const tag = stringValue.subarray(-TAG_LENGTH);

    const key = this.getKey(salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final("utf8");
  }
}

// Reference: https://medium.com/@bh03051999/aes-gcm-encryption-and-decryption-for-python-java-and-typescript-562dcaa96c22
