import { easeFunctions } from "./lib/ease.js";

export default function configure_settings(){

    window.easeFunctions = easeFunctions;

    game.settings.register("token-ease", "default-speed", {
        name: game.i18n.format("TOKENEASE.speed-title"),
        hint: game.i18n.format("TOKENEASE.speed-description"),
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("token-ease", "default-duration", {
        name: game.i18n.format("TOKENEASE.duration-title"),
        hint: game.i18n.format("TOKENEASE.duration-description"),
        scope: "world",
        config: true,
        default: 0,
        type: Number
    });

    // Collect ease functions, cleaning up their names
    let easeChoices = Object.keys(easeFunctions).reduce((obj, curr) => {
        let value = curr.split(/(?=[A-Z])/)
        value = value.length > 1 ? value.slice(1) : value;
        value = value.join(" ");
        obj[curr] = value.charAt(0).toUpperCase() + value.slice(1);
        return obj;
    }, {});

    game.settings.register("token-ease", "default-ease", {
        name: game.i18n.format("TOKENEASE.ease-title"),
        hint: game.i18n.format("TOKENEASE.ease-description"),
        scope: "world",
        config: true,
        default: "linear",
        type: String,
        choices: easeChoices
    });

    console.log("Token Ease | Configured settings");

}