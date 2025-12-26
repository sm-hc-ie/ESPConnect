<template>
  <div v-if="!partitionSegments.length" class="partitions-empty">
    <v-card class="partitions-empty__card partitions-empty__card--disconnected" variant="tonal">
      <v-card-text class="partitions-empty__body">
        <v-avatar class="partitions-empty__avatar" size="70">
          <v-icon size="34">mdi-table-refresh</v-icon>
        </v-avatar>
        <div class="partitions-empty__text">
          <div class="partitions-empty__title">{{ t('partitions.empty.title') }}</div>
          <div class="partitions-empty__subtitle">
            {{ t('partitions.empty.subtitle') }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
  <div v-else class="partition-view">
    <v-card variant="tonal" prepend-icon="mdi-table">
      <template v-slot:title>
        <div class="partition-title">
          <span class="font-weight-black">{{ partitionCardTitle }}</span>
          <span class="partition-used">{{ t('partitions.usageSummary', { size: totalUsedDisplay }) }}</span>
        </div>
      </template>
      <v-alert v-if="showUnusedAlert" type="warning" variant="tonal" class="unused-alert">
        <div>
          {{ t('partitions.alerts.unusedFlash.detected', {
            amount: unusedReadable,
            bytes: unusedBytesDisplay,
          }) }}
        </div>
        <div>
          {{ t('partitions.alerts.unusedFlash.learn') }}
          <a href="https://youtu.be/EuHxodrye6E" target="_blank" rel="noopener noreferrer">
            {{ t('partitions.alerts.resources.tutorial') }}
          </a>
          {{ t('partitions.alerts.unusedFlash.or') }}
          <a
            :href="partitionBuilderUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('partitions.alerts.resources.builder') }}
          </a>.
        </div>
      </v-alert>
      <v-alert v-else type="info" variant="tonal" class="unused-alert">
        {{ t('partitions.alerts.customizePrompt') }}
        <a href="https://youtu.be/EuHxodrye6E" target="_blank" rel="noopener noreferrer">
          {{ t('partitions.alerts.resources.tutorial') }}
        </a>
        {{ t('partitions.alerts.customizeOr') }}
        <a
          :href="partitionBuilderUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('partitions.alerts.resources.builder') }}
        </a>.
      </v-alert>
      <div class="partition-map">
        <VTooltip v-for="segment in partitionSegments" :key="segment.key" location="top" :open-delay="120"
          transition="fade-transition">
          <template #activator="{ props }">
            <div v-bind="props" :class="[
              'partition-segment',
              {
                'partition-segment--unused': segment.isUnused,
                'partition-segment--reserved': segment.isReserved,
              },
            ]" :style="{
              width: segment.width,
              flexBasis: segment.width,
              backgroundColor: segment.color,
              backgroundImage: segment.backgroundImage || undefined,
            }">
              <span v-if="segment.showLabel" class="partition-label">
                {{ segment.label || t('partitions.unnamed') }}
              </span>
              <span v-if="segment.showMeta" class="partition-meta">
                {{ segment.sizeText }} - {{ segment.offsetHex }}
              </span>
            </div>
          </template>
          <template #default>
            <div class="partition-tooltip">
              <div class="partition-tooltip__title">{{ segment.label || t('partitions.unnamed') }}</div>
              <div v-for="line in segment.tooltipLines" :key="line" class="partition-tooltip__line">
                {{ line }}
              </div>
            </div>
          </template>
        </VTooltip>
      </div>
      <v-table density="comfortable" class="mt-4">
        <thead>
          <tr>
          <th>{{ t('partitions.table.label') }}</th>
          <th>{{ t('partitions.table.type') }}</th>
          <th>{{ t('partitions.table.subtype') }}</th>
          <th>{{ t('partitions.table.offset') }}</th>
          <th>{{ t('partitions.table.size') }}</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="entry in formattedPartitions" :key="entry.offset" class="partition-table-row">
              <td>
                <div class="partition-table-label">
                  <span class="partition-color-pip" :style="{
                    backgroundColor: entry.color,
                    backgroundImage: entry.backgroundImage || undefined,
                  }"></span>
                <span>{{ entry.label || t('partitions.unnamed') }}</span>
                </div>
              </td>
              <td>{{ entry.typeLabel }}</td>
              <td>{{ entry.subtypeLabel }}</td>
              <td>{{ entry.offsetHex }}</td>
              <td>{{ entry.sizeText }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

  </div>


</template>

<script setup lang="ts">
import { computed, onMounted, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { Buffer } from 'buffer';
import type { FormattedPartitionRow, PartitionSegment, UnusedFlashSummary } from '../types/partitions';

const props = withDefaults(
  defineProps<{
    partitionSegments?: PartitionSegment[];
    formattedPartitions?: FormattedPartitionRow[];
    unusedSummary?: UnusedFlashSummary | null;
    flashSizeLabel?: string | null;
  }>(),
  {
    partitionSegments: () => [],
    formattedPartitions: () => [],
    unusedSummary: null,
    flashSizeLabel: '',
  },
);

const { partitionSegments, formattedPartitions, unusedSummary, flashSizeLabel } = toRefs(props);
const { t } = useI18n();

const PARTITION_BUILDER_URL =
  'https://thelastoutpostworkshop.github.io/ESP32PartitionBuilder/';
const PARTITION_CSV_HEADER = '# Name,Type,SubType,Offset,Size,Flags';

const showUnusedAlert = computed(() => Boolean(unusedSummary.value));
const unusedReadable = computed(() => unusedSummary.value?.readable ?? '');
const unusedBytesDisplay = computed(() =>
  unusedSummary.value?.bytes != null ? unusedSummary.value.bytes.toLocaleString() : '',
);
const partitionCardTitle = computed(() => {
  const label = flashSizeLabel.value?.trim();
  return label ? t('partitions.cardTitleWithSize', { size: label }) : t('partitions.cardTitle');
});
const partitionCsvRows = computed(() =>
  formattedPartitions.value.filter(
    row => row.size > 0 && !row.isUnused && !isReservedPartition(row),
  ),
);
const totalUsedBytes = computed(() => partitionCsvRows.value.reduce((total, row) => total + row.size, 0));
const totalUsedDisplay = computed(() => formatBytes(totalUsedBytes.value) || `${totalUsedBytes.value} bytes`);
const partitionBuilderUrl = computed(() => {
  const rows = partitionCsvRows.value;
  if (!rows.length) {
    return PARTITION_BUILDER_URL;
  }
  const csv = buildPartitionCsv(rows);
  console.debug('partition CSV:\n' + csv);
  const encoded = encodeCsvAsBase64(csv);
  return `${PARTITION_BUILDER_URL}?partitions=base64:${encoded}`;
});

onMounted(() => {
  logPartitionCsv(partitionCsvRows.value);
});

function buildPartitionCsv(rows: FormattedPartitionRow[]): string {
  const lines = rows.map(row => formatPartitionCsvLine(row));
  return `${PARTITION_CSV_HEADER}\n${lines.join('\n')}`;
}

function formatPartitionCsvLine(row: FormattedPartitionRow): string {
  const name = row.label?.trim() || row.typeLabel || 'partition';
  const typeSlug = getPartitionTypeSlug(row);
  const subtypeSlug = getPartitionSubtypeSlug(row);
  const offset = row.offsetHex || '0x0';
  const sizeHex = `0x${row.size.toString(16).toUpperCase()}`;
  return [escapeCsvValue(name), typeSlug, subtypeSlug, offset, sizeHex, ''].join(',');
}

function getPartitionTypeSlug(row: FormattedPartitionRow): string {
  const typeValue = parsePartitionValue(row.type, row.typeHex);
  if (typeValue === 0x00) return 'app';
  if (typeValue === 0x01) return 'data';
  return `type${formatByteHex(typeValue)}`;
}

function getPartitionSubtypeSlug(row: FormattedPartitionRow): string {
  const typeValue = parsePartitionValue(row.type, row.typeHex);
  const subtypeValue = parsePartitionValue(row.subtype, row.subtypeHex);
  if (typeValue === 0x00) {
    if (subtypeValue === 0x00) return 'factory';
    if (subtypeValue === 0x01) return 'test';
    if (subtypeValue >= 0x10 && subtypeValue <= 0x1f) return `ota_${subtypeValue - 0x10}`;
    if (subtypeValue === 0x20) return 'any';
    if (subtypeValue === 0x21) return 'ota_app';
    return `subtype${formatByteHex(subtypeValue)}`;
  }
  if (typeValue === 0x01) {
    return DATA_SUBTYPE_SLUG[subtypeValue] ?? `subtype${formatByteHex(subtypeValue)}`;
  }
  return `subtype${formatByteHex(subtypeValue)}`;
}

const DATA_SUBTYPE_SLUG: Record<number, string> = {
  0x00: 'ota',
  0x01: 'phy_init',
  0x02: 'nvs',
  0x03: 'coredump',
  0x04: 'nvs_keys',
  0x05: 'efuse_emulation',
  0x06: 'undefined',
  0x80: 'esphttpd_data',
  0x81: 'fat',
  0x82: 'spiffs',
  0x83: 'littlefs',
};

function parsePartitionValue(value: number | undefined, fallback?: string | null): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (fallback) {
    const normalized = fallback.toLowerCase().replace(/^0x/, '');
    const parsed = Number.parseInt(normalized, 16);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function formatByteHex(value: number): string {
  return value.toString(16).padStart(2, '0').toLowerCase();
}

function escapeCsvValue(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function encodeCsvAsBase64(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return globalThis.btoa(binary);
  }
  return Buffer.from(value, 'utf-8').toString('base64');
}

function logPartitionCsv(rows: FormattedPartitionRow[]) {
  if (!rows.length) {
    console.info('partition CSV: (no partition rows)');
    return;
  }
  console.info('partition CSV:\n' + buildPartitionCsv(rows));
}

function formatBytes(value: number | null | undefined): string | null {
  if (value == null || value < 0) {
    return null;
  }
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  let bytes = value;
  let index = 0;
  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index += 1;
  }
  const formatted = index === 0 ? `${bytes}` : bytes.toFixed(2);
  return `${formatted} ${units[index]}`;
}

function isReservedPartition(row: FormattedPartitionRow): boolean {
  const label = row.label?.trim().toLowerCase();
  return label === 'bootloader' || label === 'partition table';
}
</script>

<style scoped>
.partition-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.partition-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.partition-used {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--v-theme-on-surface) 56%, transparent);
}

.partitions-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}

.partitions-empty__card {
  border-radius: 18px;
  padding: 28px 32px;
  border: 1px dashed color-mix(in srgb, var(--v-theme-primary) 20%, transparent);
  background: color-mix(in srgb, var(--v-theme-surface) 94%, transparent);
  text-align: center;
  max-width: 420px;
}

.partitions-empty__card--disconnected {
  border-style: solid;
  border-color: color-mix(in srgb, var(--v-theme-error) 40%, transparent);
  background: color-mix(in srgb, var(--v-theme-error) 14%, var(--v-theme-surface) 92%);
}

.partitions-empty__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.partitions-empty__avatar {
  background: color-mix(in srgb, var(--v-theme-primary) 18%, transparent);
  color: color-mix(in srgb, var(--v-theme-primary) 80%, var(--v-theme-on-surface) 30%);
}

.partitions-empty__card--disconnected .partitions-empty__avatar {
  background: color-mix(in srgb, var(--v-theme-error) 26%, transparent);
  color: color-mix(in srgb, var(--v-theme-error) 85%, var(--v-theme-on-surface) 10%);
}

.partitions-empty__title {
  font-size: 1.02rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--v-theme-on-surface) 92%, transparent);
}

.partitions-empty__subtitle {
  font-size: 0.92rem;
  color: color-mix(in srgb, var(--v-theme-on-surface) 65%, transparent);
}

.partition-map {
  display: flex;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--v-theme-on-surface) 12%, transparent);
  background: color-mix(in srgb, var(--v-theme-surface) 90%, transparent);
  flex-wrap: nowrap;
  min-height: 140px;
}

.partition-segment {
  position: relative;
  padding: 10px 12px;
  min-width: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  min-width: 0;
  box-sizing: border-box;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  flex: 0 0 auto;
}

.partition-segment:first-child {
  border-left: none;
}

.partition-segment--unused {
  color: rgba(255, 255, 255, 0.88);
  background-repeat: repeat;
  background-size: 28px 28px;
}

.partition-segment--unused .partition-meta {
  opacity: 0.8;
}

.partition-segment--reserved {
  color: rgba(255, 255, 255, 0.92);
}

.partition-segment--reserved .partition-meta {
  opacity: 0.85;
}

.partition-tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.partition-tooltip__title {
  font-weight: 600;
  font-size: 0.85rem;
}

.partition-tooltip__line {
  font-size: 0.78rem;
  opacity: 0.85;
}

.partition-table-row td {
  vertical-align: middle;
}

.partition-table-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.partition-color-pip {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background-size: 18px 18px;
  background-repeat: repeat;
}

.partition-label {
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  display: block;
  width: 100%;
}

.partition-meta {
  font-size: 0.75rem;
  opacity: 0.85;
}

.partition-map:empty::before {
  content: 'No partitions detected.';
  padding: 16px;
  color: color-mix(in srgb, var(--v-theme-on-surface) 60%, transparent);
}

.unused-alert {
  margin-bottom: 8px;
}

.unused-alert a {
  color: inherit;
  text-decoration: underline;
}
</style>
