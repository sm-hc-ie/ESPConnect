// securityInfo.ts

/**
 * Raw structure returned by getSecurityInfo().
 * Mirrors the stub / esptool get_security_info output.
 */
export interface SecurityInfo {
  flags: number;
  flashCryptCnt: number;
  keyPurposes: number[];
  chipId: number;
  apiVersion: number;
}

/**
 * Decoded bitfields from `flags`.
 * Mapping comes from Espressif's explanation of get_security_info flags:
 * https://esp32.com/viewtopic.php?t=30498
 */
export interface DecodedSecurityFlags {
  /** Secure Boot enabled */
  secureBootEnabled: boolean;
  /** Aggressive revocation strategy for Secure Boot digests */
  secureBootAggressiveRevoke: boolean;
  /** Secure Download Mode (ROM restricted command set) */
  secureDownloadMode: boolean;
  /** Secure Boot key digest 0/1/2 revoked */
  secureBootKeyRevoked: [boolean, boolean, boolean];
  /** JTAG disabled via soft fuse */
  softJtagDisabled: boolean;
  /** JTAG disabled via hard fuse */
  hardJtagDisabled: boolean;
  /** USB disabled (on USB-capable SoCs) */
  usbDisabled: boolean;
  /** Instruction/Data cache disabled in download mode */
  downloadDCacheDisabled: boolean;
  downloadICacheDisabled: boolean;
}

/**
 * High-level interpretation of key purpose values.
 * Values 0–3 are the classic ESP32 esp_efuse_purpose_t mapping. :contentReference[oaicite:2]{index=2}
 * Other values are left as "Unknown / SoC-specific" to avoid guessing.
 */
export interface DecodedKeyPurpose {
  index: number;
  raw: number;
  label: string;
}

/**
 * Combination of raw info + decoded views.
 */
export interface DecodedSecurityInfo {
  raw: SecurityInfo;
  flags: DecodedSecurityFlags;
  flashEncryptionEnabled: boolean;
  flashCryptCntSetBits: number;
  keyPurposes: DecodedKeyPurpose[];
}

/**
 * Count the number of bits set in a value.
 */
export function countSetBits(value: number): number {
  let v = value >>> 0;
  let count = 0;
  while (v) {
    v &= v - 1;
    count++;
  }
  return count;
}

/**
 * Espressif: flash encryption is enabled if FLASH_CRYPT_CNT (SPI_BOOT_CRYPT_CNT)
 * has an odd number of bits set. :contentReference[oaicite:3]{index=3}
 *
 * Many SoCs use only the low 3 bits, but masking isn't strictly required;
 * we keep it configurable & explicit.
 */
export function isFlashEncryptionEnabled(flashCryptCnt: number, mask: number = 0x7): boolean {
  const masked = flashCryptCnt & mask;
  const ones = countSetBits(masked);
  return (ones & 1) === 1;
}

/**
 * Decode the esptool get_security_info flags bitfield.
 * Sources: Espressif staff explanation. :contentReference[oaicite:4]{index=4}
 */
export function decodeSecurityFlags(flags: number): DecodedSecurityFlags {
  return {
    secureBootEnabled: !!(flags & (1 << 0)),
    secureBootAggressiveRevoke: !!(flags & (1 << 1)),
    secureDownloadMode: !!(flags & (1 << 2)),
    secureBootKeyRevoked: [
      !!(flags & (1 << 3)),
      !!(flags & (1 << 4)),
      !!(flags & (1 << 5)),
    ],
    softJtagDisabled: !!(flags & (1 << 6)),
    hardJtagDisabled: !!(flags & (1 << 7)),
    usbDisabled: !!(flags & (1 << 8)),
    downloadDCacheDisabled: !!(flags & (1 << 9)),
    downloadICacheDisabled: !!(flags & (1 << 10)),
  };
}

/**
 * Map a raw key purpose value to a human-readable label.
 *
 * NOTE:
 *  - For classic ESP32: 0–3 match esp_efuse_purpose_t exactly. :contentReference[oaicite:5]{index=5}
 *  - For newer SoCs (C3/S2/S3/C6/H2) there are more purposes
 *    (XTS AES, HMAC, Secure Boot digests, etc.). Their numeric IDs aren’t
 *    consistently documented in public API, so we *do not* guess them here.
 */
export function describeKeyPurpose(raw: number): string {
  switch (raw) {
    case 0:
      return "User / unspecified key (ESP_EFUSE_KEY_PURPOSE_USER)";
    case 1:
      return "System key (ESP_EFUSE_KEY_PURPOSE_SYSTEM)";
    case 2:
      return "Flash encryption key (ESP_EFUSE_KEY_PURPOSE_FLASH_ENCRYPTION)";
    case 3:
      return "Secure Boot V2 key / digest (ESP_EFUSE_KEY_PURPOSE_SECURE_BOOT_V2)";
    default:
      // You can extend this for your own SoC-specific mapping if you want.
      return `Unknown or SoC-specific purpose (raw=${raw})`;
  }
}

/**
 * Decode the entire keyPurposes[] array.
 */
export function decodeKeyPurposes(keyPurposes: number[]): DecodedKeyPurpose[] {
  return keyPurposes.map((raw, index) => ({
    index,
    raw,
    label: describeKeyPurpose(raw),
  }));
}

/**
 * Produce a structured decoded view of SecurityInfo.
 */
export function decodeSecurityInfo(info: SecurityInfo): DecodedSecurityInfo {
  const flagsDecoded = decodeSecurityFlags(info.flags);
  const flashCryptCntSetBits = countSetBits(info.flashCryptCnt & 0x7);
  const flashEncEnabled = isFlashEncryptionEnabled(info.flashCryptCnt);

  return {
    raw: info,
    flags: flagsDecoded,
    flashEncryptionEnabled: flashEncEnabled,
    flashCryptCntSetBits,
    keyPurposes: decodeKeyPurposes(info.keyPurposes),
  };
}

/**
 * Generate a human-readable multi-line summary string.
 */
export function formatSecuritySummary(
  info: SecurityInfo,
  chipName?: string
): string {
  const decoded = decodeSecurityInfo(info);
  const f = decoded.flags;

  const lines: string[] = [];

  // CHIP
//   lines.push(`Chip: ${chipName ?? "Unknown"} (ID=0x${info.chipId.toString(16)}, API v${info.apiVersion})`);

  // FLASH ENCRYPTION
  lines.push(
    `Flash Encryption: ${
      decoded.flashEncryptionEnabled ? "ENABLED" : "disabled"
    }  (FLASH_CRYPT_CNT=0x${info.flashCryptCnt.toString(
      16,
    )}, set bits=${decoded.flashCryptCntSetBits})`
  );

  // CHIP-SPECIFIC NOTES ABOUT FLASH ENCRYPTION
  if (chipName?.startsWith("ESP32-S3") || chipName?.startsWith("ESP32-C3")) {
    lines.push("  • Using XTS_AES encryption mode (supported on this chip)");
  } else if (chipName?.startsWith("ESP32")) {
    lines.push("  • Using AES-128 flash encryption (original ESP32 scheme)");
  }

  // SECURE BOOT
  lines.push(
    `Secure Boot: ${f.secureBootEnabled ? "ENABLED" : "disabled"}${
      f.secureBootAggressiveRevoke ? " (aggressive revoke)" : ""
    }`
  );

  // CHIP-SPECIFIC SECURE BOOT NOTES
  if (chipName?.startsWith("ESP32-S3") || chipName?.startsWith("ESP32-C3")) {
    lines.push("  • Secure Boot v2 supported (digest-based, supports revocation)");
  }
  if (chipName?.startsWith("ESP32") && !chipName.includes("S")) {
    lines.push("  • Secure Boot v1 (RSA) used on original ESP32");
  }

  // JTAG PROTECTION
  const jtagStatus = f.hardJtagDisabled
    ? "HARD disabled"
    : f.softJtagDisabled
    ? "SOFT disabled"
    : "enabled";
  lines.push(`JTAG protection: ${jtagStatus}`);

  // USB PROTECTION — Only applies if chip has USB
  if (chipName?.includes("S2") || chipName?.includes("S3") || chipName?.includes("H2")) {
    lines.push(`USB protection: ${f.usbDisabled ? "disabled" : "enabled"}`);
  } else {
    lines.push("USB protection: not applicable for this chip");
  }

  // CACHE PROTECTION
  if (f.downloadDCacheDisabled || f.downloadICacheDisabled) {
    lines.push(`Download-mode caches disabled: ${
      [
        f.downloadDCacheDisabled ? "DCache" : "",
        f.downloadICacheDisabled ? "ICache" : ""
      ].filter(Boolean).join(", ")
    }`);
  }

  // KEY PURPOSES
//   lines.push("");
//   lines.push("Key Purposes:");
//   decoded.keyPurposes.forEach((kp) => {
//     lines.push(`  [Key ${kp.index}] ${kp.label}`);
//   });

  // CHIP-SPECIFIC EXTENDED NOTES
  if (chipName?.startsWith("ESP32-S3")) {
    lines.push("");
    lines.push("Note: ESP32-S3 supports XTS encryption, HMAC key slots, and flexible key purposes.");
  }

  return lines.join("\n");
}
