import { Setting, Plugin, PluginSettingTab, DropdownComponent, App } from "obsidian";
import { EventBus, SETTINGS_CHANGED, IMAGE_HOST_ENABLE_CHANEGD } from "./eventBus";

export interface GeneralSettings {
    version: string;
    general: {
        vaultName: string; // 仓库名称, 在OSS中用于区分不同仓库，建议使用字符：小写字母、数字和下划线(_)
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
}

export const DEFAULT_SETTINGS: GeneralSettings = {
    version: "1.0.0", // 动态替换为实际版本
    general: {
        vaultName: '',
        enableAutoUpdate: true,
        enableImageHosting: true,
        enableFileSync: true
    },
    oss: {
        accessKeyId: "",
        accessKeySecret: "",
        bucketName: "",
        region: "oss-cn-hangzhou"
    }
}


export class GeneralSettingTab extends PluginSettingTab {
    /**
     * @public
     */
    settings: GeneralSettings;

    /**
     * @private
     */
    eventBus: EventBus;

    constructor(app: App, plugin: Plugin, settings: GeneralSettings, eventBus: EventBus) {
        super(app, plugin)
        this.settings = settings
        this.eventBus = eventBus
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
            .setName("Vault Name")
            .setDesc("仓库名称, 在OSS中用于区分不同仓库，建议使用字符：小写字母、数字和下划线(_)")
            .addText(text => text
                .setPlaceholder("software_design_vault")
                .setValue(this.settings.general.vaultName)
                .onChange((value) => {
                    this.settings.general.vaultName = value.trim();
                    this.emitChanged();
                }));
        new Setting(containerEl)
            .setName("自动更新")
            .addToggle(toggle => toggle
                .setValue(this.settings.general.enableAutoUpdate)
                .onChange((value) => {
                    this.settings.general.enableAutoUpdate = value;
                    this.emitChanged();
                }));
        new Setting(containerEl)
            .setName("图床服务")
            .setDesc("允许上传图片至阿里云OSS，并生成Markdown链接")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.settings.general.enableImageHosting)
                    .onChange((value) => {
                        this.settings.general.enableImageHosting = value;
                        this.emitChanged();
                        this.eventBus.emit(IMAGE_HOST_ENABLE_CHANEGD, this.settings)
                    })
            );
        new Setting(containerEl)
            .setName("文件同步")
            .setDesc("自动同步文档至阿里云OSS，并在多设备间保持一致性")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.settings.general.enableFileSync)
                    .onChange((value) => {
                        this.settings.general.enableFileSync = value;
                        this.emitChanged();
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
                    .onChange((value: string) => {
                        this.settings.oss.region = value;          // 保存设置
                        this.emitChanged();               // 持久化存储
                    });
            });
        new Setting(containerEl)
            .setName("AccessKey ID")
            .addText(text => text
                .setPlaceholder("Enter your AccessKey ID")
                .setValue(this.settings.oss.accessKeyId)
                .onChange((value) => {
                    this.settings.oss.accessKeyId = value.trim();
                    this.emitChanged();
                }));
        new Setting(containerEl)
            .setName("AccessKey Secret")
            .addText(text => {
                text.inputEl.type = "password"
                text
                    .setPlaceholder("Enter your AccessKey Secret")
                    .setValue(this.settings.oss.accessKeySecret)
                    .onChange((value) => {
                        this.settings.oss.accessKeySecret = value.trim();
                        this.emitChanged();
                    })
            })
        new Setting(containerEl)
            .setName("Bucket")
            .setDesc("存储桶的名字")
            .addText(text => text
                .setPlaceholder("example-bucket")
                .setValue(this.settings.oss.bucketName)
                .onChange((value) => {
                    this.settings.oss.bucketName = value.trim();
                    this.emitChanged();
                }));

    }


    private emitChanged() {
        this.eventBus.emit(SETTINGS_CHANGED, this.settings)
    }
}