import { Setting, Plugin, PluginSettingTab, DropdownComponent, App } from "obsidian";

export interface GeneralSettings {
    version: string;
    general: {
        enableAutoUpdate: boolean;
        enableImageHosting: boolean; // 是否启用图床
        enableFileSync: boolean; // 是否启用文件同步
    };
    oss: {
        accessKeyId: string;
        accessKeySecret: string;
        bucketName: string;
        region: string;
    };
    deepseek: {
        apiKey: string;
        model: string;
        temperature: number;
    };
}

const DEFAULT_SETTINGS: GeneralSettings = {
    version: "1.0.0", // 动态替换为实际版本
    general: {
        enableAutoUpdate: true,
        enableImageHosting: true,
        enableFileSync: true
    },
    oss: {
        accessKeyId: "",
        accessKeySecret: "",
        bucketName: "",
        region: "oss-cn-hangzhou"
    },
    deepseek: {
        apiKey: "",
        model: "deepseek-chat",
        temperature: 0.7
    }
}


export class GeneralSettingTab extends PluginSettingTab {
    /**
     * @private
     */
    plugin: Plugin;
    /**
     * @public
     */
    settings: GeneralSettings;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin)
        this.plugin = plugin
    }
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // 标题栏（带版本号）
        containerEl.createEl("h1", { cls: 'setting-title', text: `GardenOS Settings` });
        containerEl.createEl("div", { cls: 'setting-item-description', text: `你的下一代知识操作系统 —— 专为数字花园打造的开箱即用解决方案` });

        // ===================== General 配置 =====================
        containerEl.createEl("h2", { cls: 'setting-section', text: `General` });
        new Setting(containerEl)
            .setName("自动更新")
            .addToggle(toggle => toggle
                .setValue(this.settings.general.enableAutoUpdate)
                .onChange(async (value) => {
                    this.settings.general.enableAutoUpdate = value;
                    await this.saveSettings();
                }));
        new Setting(containerEl)
            .setName("图床服务")
            .setDesc("允许上传图片至阿里云OSS，并生成Markdown链接")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.settings.general.enableImageHosting)
                    .onChange(async (value) => {
                        this.settings.general.enableImageHosting = value;
                        await this.saveSettings(); 
                    })
            );
        new Setting(containerEl)
            .setName("文件同步")
            .setDesc("自动同步文档至云端，并在多设备间保持一致性")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.settings.general.enableFileSync)
                    .onChange(async (value) => {
                        this.settings.general.enableFileSync = value;
                        await this.saveSettings();
                    })
            );

        // ===================== OSS 配置 =====================
        containerEl.createEl("h2", { cls: 'setting-section', text: `阿里云OSS` });
        containerEl.createEl("div", { cls: 'setting-item-description', text: `阿里云OSS对象存储服务，用于内置图床服务、文件同步服务` });
        new Setting(containerEl)
            .setName("区域(Region)")
            .addDropdown((dropdown: DropdownComponent) => {
                dropdown
                    .addOption("oss-cn-hangzhou", "华东1（杭州）")
                    .addOption("oss-cn-shanghai", "华东2（上海）")
                    .addOption("oss-cn-qingdao", "华北1（青岛）")
                    .addOption("oss-cn-beijing", "华北2（北京）")
                    .setValue(this.settings.oss.region || "oss-cn-hangzhou")   // 设置默认值
                    .onChange(async (value: string) => {
                        this.settings.oss.region = value;          // 保存设置
                        await this.saveSettings();               // 持久化存储
                    });
            });
        new Setting(containerEl)
            .setName("AccessKey ID")
            .addText(text => text
                .setPlaceholder("Enter your AccessKey ID")
                .setValue(this.settings.oss.accessKeyId)
                .onChange(async (value) => {
                    this.settings.oss.accessKeyId = value.trim();
                    await this.saveSettings();
                }));
        new Setting(containerEl)
            .setName("AccessKey Secret")
            .addText(text => {
                text.inputEl.type = "password"
                text
                    .setPlaceholder("Enter your AccessKey Secret")
                    .setValue(this.settings.oss.accessKeySecret)
                    .onChange(async (value) => {
                        this.settings.oss.accessKeySecret = value.trim();
                        await this.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName("Bucket")
            .setDesc("存储桶的名字")
            .addText(text => text
                .setPlaceholder("example-bucket")
                .setValue(this.settings.oss.bucketName)
                .onChange(async (value) => {
                    this.settings.oss.bucketName = value.trim();
                    await this.saveSettings();
                }));

        // ===================== Deepseek配置 =====================
        containerEl.createEl("h2", { cls: 'setting-section', text: `Deepseek` });
        new Setting(containerEl)
            .setName("API Key")
            .addText((text) => {
                text.inputEl.type = "password"
                text
                    .setPlaceholder("sk-xxxxxxxxxxxxxxxx")
                    .setValue(this.settings.deepseek.apiKey)
                    .onChange(async (value) => {
                        this.settings.deepseek.apiKey = value.trim();
                        await this.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName("Model")
            .addDropdown(dropdown => dropdown
                .addOptions({
                    "deepseek-chat": "Deepseek Chat",
                    "deepseek-coder": "Deepseek Coder",
                    "deepseek-math": "Deepseek Math"
                })
                .setValue(this.settings.deepseek.model)
                .onChange(async (value) => {
                    this.settings.deepseek.model = value;
                    await this.saveSettings();
                }));
        new Setting(containerEl)
            .setName("Temperature")
            .setDesc("Higher values make output more random")
            .addSlider(slider => slider
                .setLimits(0, 2, 0.1)
                .setValue(this.settings.deepseek.temperature)
                .onChange(async (value) => {
                    this.settings.deepseek.temperature = value;
                    await this.saveSettings();
                })
                .setDynamicTooltip()
            );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
    }
    private async saveSettings() {
        await this.plugin.saveData(this.settings);
    }
}