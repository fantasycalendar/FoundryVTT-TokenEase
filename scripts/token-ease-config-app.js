import CONSTANTS from "./constants.js";
import { easeFunctions } from "./lib/ease.js";

export default class TokenEaseConfig extends FormApplication {

	/**
	 * @param {Object} token
	 */
	constructor(token) {
		super();
		this.token = token;
		this.data = token.getFlag(CONSTANTS.MODULE_NAME, CONSTANTS.MOVEMENT_FLAG);
		if (!this.data) {
			this.data = {
				speed: game.settings.get(CONSTANTS.MODULE_NAME, "default-speed"),
				duration: game.settings.get(CONSTANTS.MODULE_NAME, "default-duration"),
				configEase: game.settings.get(CONSTANTS.MODULE_NAME, "default-ease"),
				configInOut: game.settings.get(CONSTANTS.MODULE_NAME, "ease-type")
			}
		}
	}

	/** @inheritdoc */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			title: "Token-Ease Token Overrides",
			classes: ["sheet", "item-pile-filters-editor"],
			template: `modules/token-ease/templates/token-ease-config.html`,
			width: 400,
			resizable: false
		});
	}

	static show(token) {
		for (let app of Object.values(ui.windows)) {
			if (app instanceof this && app?.token === token) {
				return app.render(false, { focus: true });
			}
		}
		return new this(token).render(true);
	}

	getData(options) {
		const data = super.getData(options)

		data.settings = this.data;

		const easeChoices = Object.keys(easeFunctions).filter(ease => ease.indexOf("InOut") > -1).map((e) => e.replace("easeInOut", ""));
		easeChoices.unshift("Linear")

		data.easeChoices = easeChoices.reduce((acc, e) => {
			acc[e] = e;
			return acc
		}, {});

		data.inOutChoices = {
			"In": "In",
			"Out": "Out",
			"InOut": "InOut"
		}

		return data;
	}

	async _updateObject(event, formData) {

		if (event.submitter.value === "0") return;

		if (!formData.enabled) {
			return this.token.unsetFlag(CONSTANTS.MODULE_NAME, CONSTANTS.MOVEMENT_FLAG);
		}

		formData.ease = formData["configEase"] === "Linear"
			? formData["configEase"]
			: "ease" + formData["configInOut"] + formData["configEase"];

		return this.token.setFlag(CONSTANTS.MODULE_NAME, CONSTANTS.MOVEMENT_FLAG, formData);
	}

}
