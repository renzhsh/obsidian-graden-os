import { Plugin } from 'obsidian';
import PluginInstaller from "./lib/pluginInstaller";
import { GeneralSettingTab } from "./lib/generalSettings";


export default class MyPlugin extends Plugin {

	async onload() {
		console.log('gardenOS start')

		const settingTab = new GeneralSettingTab(this.app, this);
		await settingTab.loadSettings()

		this.addSettingTab(settingTab);

		const installer = new PluginInstaller(this);
		installer.installPlugin()

	}

}
