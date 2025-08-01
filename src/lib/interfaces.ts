export interface PluginInfo {
    id: string;
    version: string;
    repo: string;  // "username/repo"
}

export interface InstallResult {
    success: boolean;
    message: string;
}