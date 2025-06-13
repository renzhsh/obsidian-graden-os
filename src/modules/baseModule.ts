import { Plugin } from 'obsidian';
import { EventBus } from "src/lib/eventBus";
import { GeneralSettings } from 'src/lib/generalSettings';

/**
 * 
 */
export abstract class BaseModule {
    /**
     * @protected
     */
    plugin: Plugin;
    /**
     * @protected
     */
    eventBus: EventBus;
    /**
     * @protected
     */
    settings: GeneralSettings;

    /**
     * @protected module是否安装
     */
    installed: boolean = false;

    constructor(plugin: Plugin, eventBus: EventBus, settings: GeneralSettings) {
        this.plugin = plugin
        this.eventBus = eventBus
        this.settings = settings
    }

    public async load(): Promise<void> {
        const moduleEnabled = this.getModuleEnabled()
        const ChangeEventName = this.getModuleSettingChangeEventName()
        if (moduleEnabled) {
            await this.install()
            this.installed = true
        }

        this.eventBus.subscribe(ChangeEventName, async (val) => {
            const moduleEnabled = this.getModuleEnabled()
            if (this.installed && !moduleEnabled) {
                await this.uninstall()
                this.installed = false
            }
            else if (!this.installed && moduleEnabled) {
                await this.install()
                this.installed = true
            }
        })

        await this.postLoaded()
    }

    /**
     * 模块是否启用
     */
    abstract getModuleEnabled(): boolean;

    /**
     * 获取setting变更事件名
     */
    abstract getModuleSettingChangeEventName(): string;

    /**
     * 安装模块
     */
    abstract install(): Promise<void>;

    /**
     * 卸载模块
     */
    abstract uninstall(): Promise<void>;

    protected async postLoaded(): Promise<void> {
        await Promise.resolve()
    }
}