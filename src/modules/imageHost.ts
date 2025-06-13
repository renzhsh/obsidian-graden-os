import { IMAGE_HOST_ENABLE_CHANEGD } from "src/lib/eventBus";
import { BaseModule } from './baseModule';
import { MarkdownView, Notice } from "obsidian";
import OSS from "ali-oss";

/**
 * 图床服务
 */
export class ImageHost extends BaseModule {
    getModuleEnabled(): boolean {
        return this.settings.general.enableImageHosting
    }
    getModuleSettingChangeEventName(): string {
        return IMAGE_HOST_ENABLE_CHANEGD;
    }

    async install(): Promise<void> {
        // 监听剪贴板粘贴事件（paste）
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("editor-paste", (evt: ClipboardEvent) => {
                if (!evt.clipboardData?.items) return;
                if (!this.installed) return;
                // 检查是否是图片
                for (const item of Array.from(evt.clipboardData.items)) {
                    if (item.type.startsWith("image/")) {
                        evt.preventDefault(); // 阻止默认粘贴
                        this.handleImageUpload(item.getAsFile()!);
                    }
                }
            })
        );

    }

    async uninstall(): Promise<void> {
        console.log('uninstall imageHost')
    }

    async uploadToOSS(file: File): Promise<string | null> {
        const client = new OSS({
            region: this.settings.oss.region,       // e.g. "oss-cn-hangzhou"
            accessKeyId: this.settings.oss.accessKeyId,
            accessKeySecret: this.settings.oss.accessKeySecret,
            bucket: this.settings.oss.bucketName,
        });


        try {
            const date = new Date();
            const template = 'obsidian/{year}-{month}/{timestamp}-{filename}'
            const filename = file.name

            // Replace individual placeholders
            const fileName = template
                .replace(/\{year\}/g, `${date.getFullYear()}`)
                .replace(/\{month\}/g, `${String(date.getMonth() + 1).padStart(2, '0')}`) // Month is 0-indexed
                .replace(/\{day\}/g, `${String(date.getDate()).padStart(2, '0')}`)
                .replace(/\{timestamp\}/g, `${Date.now()}`)
                .replace(/\{filename\}/g, filename);
            const result = await client.put(fileName, file);
            return result.url;
        } catch (error) {
            console.error("OSS Upload Error:", error);
            new Notice('图片上传失败，请检查配置项是否正确。');
            return null;
        }
    }

    async handleImageUpload(file: File) {
        const ossUrl = await this.uploadToOSS(file);
        if (!ossUrl) return;

        // 替换当前光标位置的文本
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            activeView.editor.replaceSelection(`![](${ossUrl})`);
        }
    }

}