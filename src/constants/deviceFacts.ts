export const FACT_ICONS: Record<string, string> = {
  'Chip Variant': 'mdi-chip',
  Revision: 'mdi-update',
  'Embedded Flash': 'mdi-memory',
  'Embedded PSRAM': 'mdi-chip',
  'Flash Vendor (eFuse)': 'mdi-factory',
  'PSRAM Vendor (eFuse)': 'mdi-factory',
  'Flash ID': 'mdi-barcode',
  'Flash Manufacturer': 'mdi-domain',
  'Flash Device': 'mdi-chip',
  'Package Form Factor': 'mdi-package-variant-closed',
  'USB Bridge': 'mdi-usb-port',
  'Connection Baud': 'mdi-speedometer',
  'eFuse Block Version': 'mdi-shield-key',
  'PWM/LEDC': 'mdi-waveform',
  'CPU Cores': 'mdi-animation',
  'Max CPU Frequency':'mdi-speedometer'
};

export const PRIMARY_FACTS = [
  'CPU Cores',
  'Max CPU Frequency',
  'Embedded PSRAM',
  'Flash Device',
  'USB Bridge',
  'Connection Baud',
  'Embedded Flash',
  ];

export const FACT_GROUP_CONFIG = [
  {
    title: 'Package & Revision',
    icon: 'mdi-chip',
    labels: ['Chip Variant', 'Package Form Factor', 'Revision','CPU Cores','Max CPU Frequency'],
  },
  {
    title: 'Embedded Memory',
    icon: 'mdi-memory',
    labels: [
      'Embedded Flash',
      'Embedded PSRAM',
      'Flash ID',
      'Flash Manufacturer',
      'Flash Device',
      'Flash Vendor (eFuse)',
      'PSRAM Vendor (eFuse)',
    ],
  },
  {
    title: 'Security',
    icon: 'mdi-shield-key-outline',
    labels: ['eFuse Block Version',
      'Flash Encryption',
      'Flash Encryption Details',
      'Flash Encryption Mode',
      'Secure Boot',
      'Secure Boot Type',
      'JTAG Protection',
      'USB Protection',
      'Download-Mode Caches',
      'Security Note'
    ],
  },
  {
    title: 'Peripherals',
    icon: 'mdi-waveform',
    labels: ['PWM/LEDC'],
  },
  {
    title: 'Connection',
    icon: 'mdi-usb-port',
    labels: ['USB Bridge', 'Connection Baud'],
  },
  {
    title: 'Documentation',
    icon: 'mdi-book-open-page-variant',
    labels: [
      'Hardware Reference',
      'Datasheet',
      'Technical Reference Manual',
      'Errata',
      'Hardware Design Guidelines',
    ],
  },
];
