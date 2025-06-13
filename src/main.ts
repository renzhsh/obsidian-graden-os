import { Plugin } from 'obsidian';
import PluginInstaller from "./lib/pluginInstaller";
import { GeneralSettings, GeneralSettingTab, DEFAULT_SETTINGS } from "./lib/generalSettings";
import { EventBus, SETTINGS_CHANGED } from './lib/eventBus';
import { ImageHost } from './modules';


export default class MyPlugin extends Plugin {
	/**
	 * @public
	 */
	settings: GeneralSettings;


	/**
	 * @public
	 */
	eventBus: EventBus;

	async onload() {
		console.log('gardenOS start')
		this.eventBus = new EventBus()

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.addSettingTab(new GeneralSettingTab(this.app, this, this.settings, this.eventBus));

		this.eventBus.subscribe(SETTINGS_CHANGED, async (val) => {
			await this.saveData(this.settings);
		})

		await this.loadModules()

		const installer = new PluginInstaller(this);
		installer.installPlugin()

	}

	async loadModules() {
		await new ImageHost(this, this.eventBus, this.settings).load()
	}

}
