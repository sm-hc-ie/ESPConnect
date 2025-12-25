const zh = {
  app: {
    title: 'ESPConnect',
    sectionsLabel: '板块',
    resourcesLabel: '资源',
  },
  navigation: {
    deviceInfo: '设备信息',
    partitions: '分区',
    apps: '应用',
    nvs: 'NVS 检查',
    spiffs: 'SPIFFS 工具',
    littlefs: 'LittleFS 工具',
    fatfs: 'FATFS 工具',
    flash: '闪存工具',
    console: '串口监视器',
    log: '会话日志',
    about: '关于',
  },
  resources: {
    tutorial: '教程',
    buyCoffee: '请我喝杯咖啡',
    getHelp: '获取帮助',
  },
  actions: {
    connect: '连接',
    disconnect: '断开连接',
  },
  forms: {
    baudRate: '波特率',
  },
  tooltips: {
    higherBaud: '可以使用更高的波特率',
  },
  alerts: {
    browserUnsupported:
      '此浏览器不支持 Web Serial API。请使用 Chrome、Edge 或其他基于 Chromium 的浏览器。',
    serialMonitorClosed: '串口监视器已关闭 - 单击“连接”重新进入维护模式。',
  },
  dialogs: {
    connecting: '正在连接',
    littlefsBackup: 'LittleFS 备份',
    littlefsLoading: '正在加载 LittleFS',
    littlefsSaving: '正在保存 LittleFS',
    preparingBackup: '正在准备备份...',
    writingLittlefs: '正在写入 LittleFS 映像...',
    littlefsRestoring: '正在还原 LittleFS',
    fatfsBackup: 'FATFS 备份',
    cancel: '取消',
    confirm: '确认',
    continue: '继续',
    confirmationTitle: '请确认',
  },
  disconnected: {
    defaultTitle: '未连接设备',
    defaultSubtitle: '连接到 ESP32 以继续。',
    deviceInfo: '连接到 ESP32 以查看设备信息。',
    nvs: '连接到具有 NVS 分区的 ESP32 以检查存储的键/值对。',
    spiffs: '连接到 ESP32 以浏览和编辑 SPIFFS 文件。',
    littlefs: '连接到具有 LittleFS 分区的 ESP32 以使用这些工具。',
    fatfs: '连接到具有 FATFS 分区的 ESP32 以使用这些工具。',
    apps: '连接设备以检查 OTA 应用槽。',
    flash: '连接你的板子以烧录固件或检查寄存器。',
  },
  deviceInfo: {
    summary: {
      flashClock: 'Flash 与时钟',
      featureSet: '特性集',
      capabilities: '{count} 项功能',
      noFeatures: '未报告任何特性',
      more: '+{count} 更多',
      noOptionalCapabilities: '没有可选功能。',
    },
    crystal: '晶振 {crystal}',
    unknown: '未知',
  },
  about: {
    title: '关于 ESPConnect',
    description: {
      intro:
        'ESPConnect 是面向 ESP32 设备的浏览器工具集，将常见的维护任务统一起来，让你无需安装桌面程序即可连接、查看和更新开发板。',
      details:
        '该应用通过 Web Serial API 与设备通信，并提供固件烧录、分区管理、文件系统编辑、备份/恢复、会话日志和串口监视器等高级工具，用于故障排查。它基于',
      reference: 'WebSerial ESPTool',
    },
    filesystems: {
      title: '文件系统工具',
      spiFFS: {
        label: 'SPIFFS',
        description: '在写回 Flash 之前，在本地通过 TypeScript 模拟器暂存变更。',
      },
      littleFS: {
        label: 'LittleFS',
        description: '由 littlefs-wasm 模块提供，确保与设备端存储保持一致。',
      },
      fatFS: {
        label: 'FATFS',
        description: '新的 wasm 驱动工具链，用于 FAT 分区，反映设备的实际布局。',
      },
      summary:
        '拖放上传、常见文件类型的预览/播放、差异摘要和强制备份机制在保存前保障流程安全。',
    },
    firmware: {
      title: '固件与维护',
      flash: '烧录自定义二进制，带进度跟踪、预设和安全提示。',
      inspect: '一目了然地检查分区表、OTA 槽、设备描述符和闪存使用情况。',
      monitor: '串口监视器带命令快捷键和会话日志，便于排查问题。',
    },
    safety: {
      title: '安全优先流程',
      body:
        '所有破坏性操作都在确认提示和近期备份的保护下进行。ESPConnect 会将暂存更改保存在内存里，只有在你显式写入 Flash 时才生效，方便审查或通过重新读取分区回退。',
    },
    privacy: {
      title: '隐私与安全',
      body:
        'ESPConnect 完全运行于浏览器，无后端、账户或遥测。固件、备份和诊断数据始终保留在本地，仅在你下载时才会移动。请始终从可信来源烧录固件。',
    },
  },
  language: {
    english: '英语',
    chinese: '中文',
    switchTo: '切换到{language}',
  },
  theme: {
    light: '亮色',
    dark: '暗色',
    switch: '切换到{theme}主题',
  },
  status: {
    connected: '已连接',
    disconnected: '未连接',
    preparingBackup: '正在准备备份...',
    writingLittlefs: '正在写入 LittleFS 映像...',
  },
};

export default zh;
