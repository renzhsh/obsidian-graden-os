// src/lib/PluginInstaller.ts
import { Plugin, Notice, requestUrl, App, PluginManifest, RequestUrlResponsePromise } from "obsidian";
import { PluginInfo, InstallResult } from "./interfaces";

function githubRequest(url: string): RequestUrlResponsePromise {
    return requestUrl({
        url,
        headers: {
            Authorization: "Bearer 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", // 替换成你的 Token
            "User-Agent": "Obsidian-Plugin" // GitHub 要求提供 User-Agent
        }
    });
}


export default class PluginInstaller {

    /**
     * @public
     */
    app: App;
    /**
     * @public
     */
    manifest: PluginManifest;

    constructor(private plugin: Plugin) {
        this.manifest = plugin.manifest
        this.app = plugin.app
    }

    async installPlugin(): Promise<InstallResult> {
        console.log(`gradenOS -- install plugin`)
        // 1. 加载 plugins.json
        const pluginList = await this.loadPluginConfig();

        for (const plugin of pluginList) {
            const result = await this.installSinglePlugin(plugin);
            new Notice(result.message);
        }

        return {
            success: true,
            message: ``,
        }
    }


    // ✅ 新增方法：从 plugins.json 读取配置
    private async loadPluginConfig(): Promise<PluginInfo[]> {
        try {
            // 路径：插件根目录/plugins.json
            const configPath = `${this.manifest.dir}/plugins.json`;
            const content = await this.app.vault.adapter.read(configPath);
            return JSON.parse(content) as PluginInfo[];
        } catch (err) {
            new Notice("Failed to load plugins.json. Using default list.");
            console.error("Load config error:", err);

            // 默认备用列表
            return [];
        }
    }
    // ✅ 核心方法：安装单个插件
    private async installSinglePlugin(plugin: PluginInfo): Promise<InstallResult> {
        try {

            // 检查插件是否已存在
            const pluginDir = `${this.plugin.app.vault.configDir}/plugins/${plugin.id}`;
            const { dirExists, filesExist } = await this.checkPluginExists(pluginDir);
            if (dirExists && filesExist) {
                return {
                    success: true,
                    message: `Plugin ${plugin.id} already exists. Skipping installation.`,
                };
            }
            // 从 GitHub Releases 获取文件
            const { jsUrl, manifestUrl, styleUrl } = await this.getReleaseAssets(plugin);

            // 下载文件
            const [jsContent, manifestContent] = await Promise.all([
                this.downloadFile(jsUrl),
                this.downloadFile(manifestUrl),
            ]);

            const styleContent = styleUrl ? await this.downloadFile(styleUrl) : ""

            // 写入本地插件目录
            await this.writeFiles(pluginDir, jsContent, manifestContent, styleContent);

            return {
                success: true,
                message: `Installed ${plugin.id} v${plugin.version}`,
            };
        } catch (err) {
            return {
                success: false,
                message: `Failed to install ${plugin.id}: ${err.message}`,
            };
        }
    }

    /**
     * 检查插件目录和文件是否已存在
     */
    private async checkPluginExists(pluginDir: string): Promise<{
        dirExists: boolean;
        filesExist: boolean;
    }> {
        try {
            // 检查目录是否存在
            const dirExists = await this.plugin.app.vault.adapter.exists(pluginDir);
            if (!dirExists) {
                return { dirExists: false, filesExist: false };
            }
            // 检查主要文件是否存在
            const requiredFiles = ["main.js", "manifest.json"];
            const fileChecks = await Promise.all(
                requiredFiles.map(file =>
                    this.plugin.app.vault.adapter.exists(`${pluginDir}/${file}`)
                )
            );
            return {
                dirExists: true,
                filesExist: fileChecks.every(exists => exists),
            };
        } catch (err) {
            console.error("Error checking plugin existence:", err);
            return { dirExists: false, filesExist: false };
        }
    }

    // 🔹 获取 GitHub Release 资源
    private async getReleaseAssets(plugin: PluginInfo) {
        const releaseUrl = `https://api.github.com/repos/${plugin.repo}/releases/tags/${plugin.version}`;
        const response = await githubRequest(releaseUrl);
        const assets = response.json.assets as Array<{ name: string; browser_download_url: string }>;

        const jsAsset = assets.find((a) => a.name.endsWith(".js"));
        const manifestAsset = assets.find((a) => a.name === "manifest.json");
        const styleAsset = assets.find((a) => a.name === "styles.css");

        if (!jsAsset || !manifestAsset) {
            throw new Error("Required files not found in release.");
        }

        return {
            jsUrl: jsAsset.browser_download_url,
            manifestUrl: manifestAsset.browser_download_url,
            styleUrl: (styleAsset && styleAsset.browser_download_url) || ''
        };
    }

    // 🔹 下载文件内容
    private async downloadFile(url: string): Promise<string> {
        const response = await githubRequest(url);
        return response.text;
    }

    // 🔹 写入本地文件
    private async writeFiles(dir: string, jsContent: string, manifestContent: string, styleContent: string) {
        const { adapter } = this.plugin.app.vault;
        await adapter.mkdir(dir); // 创建插件目录

        await Promise.all([
            adapter.write(`${dir}/main.js`, jsContent),
            adapter.write(`${dir}/manifest.json`, manifestContent),
        ]);

        if (styleContent) {
            await Promise.all([
                adapter.write(`${dir}/styles.css`, styleContent)
            ]);
        }

    }
}
