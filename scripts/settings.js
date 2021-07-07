import { easeFunctions } from "./lib/ease.js";

const easeChoices = Object.keys(easeFunctions).filter(ease => ease.indexOf("InOut") > -1).map((e) => e.replace("easeInOut", ""));
easeChoices.unshift("Linear")
const debouncedDoubleCheckEase = debounce(() => {
    let easeInOut = game.settings.get("token-ease", "ease-type");
    let easeIn = easeInOut !== 1 ? "In" : "";
    let easeOut = easeInOut >= 1 ? "Out" : "";
    let easeIndex = game.settings.get("token-ease", "config-ease");
    let ease = easeChoices[easeIndex];
    if(ease !== "Linear" && !(easeIn === "" && easeOut === "")){
        ease = `ease${easeIn}${easeOut}${ease}`;
    }else{
        ease = ease.toLowerCase();
    }
    game.settings.set("token-ease", "default-ease", ease);
}, 100)

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

    game.settings.register("token-ease", "config-ease", {
        name: game.i18n.format("TOKENEASE.ease-title"),
        hint: game.i18n.format("TOKENEASE.ease-description"),
        scope: "world",
        config: true,
        default: 0,
        type: String,
        choices: easeChoices,
        onChange: () => debouncedDoubleCheckEase()
    });

    game.settings.register("token-ease", "default-ease", {
        name: game.i18n.format("TOKENEASE.ease-title"),
        hint: game.i18n.format("TOKENEASE.ease-description"),
        scope: "world",
        config: false,
        default: "linear",
        type: String
    });

    game.settings.register("token-ease", "ease-type", {
        name: game.i18n.format("TOKENEASE.ease-type-title"),
        hint: game.i18n.format("TOKENEASE.ease-type-description"),
        scope: "world",
        config: true,
        default: 2,
        type: Number,
        choices: ["In", "Out", "In & Out"],
        onChange: () => debouncedDoubleCheckEase()
    });

    game.settings.register("token-ease", "animation-on-movement-keys", {
        name: game.i18n.format("TOKENEASE.movement-keys-title"),
        hint: game.i18n.format("TOKENEASE.movement-keys-description"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
}