import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import PluginInstaller from "./lib/pluginInstaller";
import { PluginInfo } from "./lib/interfaces";


// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('gardenOS start')
		const installer = new PluginInstaller(this);
		installer.installPlugin()

	}
	
}
