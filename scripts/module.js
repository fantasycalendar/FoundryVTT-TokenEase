import { configure_hotkeys, configure_settings, keyboardState } from "./settings.js";
import CONSTANTS from "./constants.js";
import TokenEaseConfig from "./token-ease-config-app.js";
import { easeFunctions } from "./lib/ease.js";

Hooks.once('init', async function () {
	console.log("Token Ease | Patched core functions");
	configure_settings();
	configure_hotkeys();
	console.log("Token Ease | Ready to (pl)ease!");
});

Hooks.once("ready", async function () {
	for (const [name, func] of Object.entries(easeFunctions)) {
		CanvasAnimation[name] = func;
	}
})


Hooks.on('preUpdateToken', (token, changes, data, ...args) => {

	// If position hasn't changed, or animate is false, don't change anything.
	if (!(changes.x || changes.y) || data.animate === false) return;

	// If the owner of the token is holding down alt, the token will instantly move to the end point
	if (token.isOwner && keyboardState.instantMove) {

		foundry.utils.setProperty(data, `animation.duration`, 0);

	} else {

		if (!game.settings.get("token-ease", "animation-on-movement-keys")) {
			const ray = new Ray(
				{ x: token.x, y: token.y },
				{ x: changes?.x ?? token.x, y: changes?.y ?? token.y }
			);

			// If movement distance <= grid size, and play animation on movement keys isn't enabled, revert to foundry default
			let smallMovement = Math.max(Math.abs(ray.dx), Math.abs(ray.dy)) <= canvas.grid.size;
			if (smallMovement && !data?.animation?.speed && !data?.animation?.duration) {
				foundry.utils.setProperty(data, `animation`, {
					movementSpeed: 10,
					duration: 0,
					easing: "linear"
				});
			}
		}

		// Get token default flags, but fall back to default if needed
		const tokenFlags = token.getFlag(CONSTANTS.MODULE_NAME, CONSTANTS.MOVEMENT_FLAG);

		const movementSpeed = data?.animation?.speed ?? tokenFlags?.speed ?? game.settings.get("token-ease", "default-speed") ?? 6;
		const duration = data?.animation?.duration ?? tokenFlags?.duration ?? game.settings.get("token-ease", "default-duration") ?? 0;
		const easing = data?.animation?.ease ?? tokenFlags?.ease ?? game.settings.get("token-ease", "default-ease") ?? "linear";

		if(movementSpeed){
			foundry.utils.setProperty(data, `animation.movementSpeed`, movementSpeed);
		}
		if(duration){
			foundry.utils.setProperty(data, `animation.duration`, duration);
		}
		if(easing){
			foundry.utils.setProperty(data, `animation.easing`, easing);
		}

	}
});


Hooks.on('getTokenConfigHeaderButtons', (app, buttons) => {
	if (!app.token.isOwner) return;
	buttons.unshift({
		class: "configure-token-ease",
		icon: "fas fa-running",
		label: "Token Ease",
		onclick: (ev) => {
			TokenEaseConfig.show(app.token);
		}
	});
})
