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
        name: game.i18n.format("TOKEN-EASE.speed-title"),
        hint: game.i18n.format("TOKEN-EASE.speed-description"),
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("token-ease", "default-duration", {
        name: game.i18n.format("TOKEN-EASE.duration-title"),
        hint: game.i18n.format("TOKEN-EASE.duration-description"),
        scope: "world",
        config: true,
        default: 0,
        type: Number
    });

    game.settings.register("token-ease", "config-ease", {
        name: game.i18n.format("TOKEN-EASE.ease-title"),
        hint: game.i18n.format("TOKEN-EASE.ease-description"),
        scope: "world",
        config: true,
        default: 0,
        type: String,
        choices: easeChoices,
        onChange: () => debouncedDoubleCheckEase()
    });

    game.settings.register("token-ease", "default-ease", {
        name: game.i18n.format("TOKEN-EASE.ease-title"),
        hint: game.i18n.format("TOKEN-EASE.ease-description"),
        scope: "world",
        config: false,
        default: "linear",
        type: String
    });

    game.settings.register("token-ease", "ease-type", {
        name: game.i18n.format("TOKEN-EASE.ease-type-title"),
        hint: game.i18n.format("TOKEN-EASE.ease-type-description"),
        scope: "world",
        config: true,
        default: 2,
        type: Number,
        choices: ["In", "Out", "In & Out"],
        onChange: () => debouncedDoubleCheckEase()
    });

    game.settings.register("token-ease", "animation-on-movement-keys", {
        name: game.i18n.format("TOKEN-EASE.movement-keys-title"),
        hint: game.i18n.format("TOKEN-EASE.movement-keys-description"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
}

export const keyboardState = {
    instantMove: false
}

export function configure_hotkeys(){

    game.keybindings.register("token-ease", "instantMovement", {
        name: "TOKEN-EASE.instant-movement",
        editable: [
            { key: "AltLeft" }
        ],
        onDown: () => {
            keyboardState.instantMove = true;
        },
        onUp: () => {
            keyboardState.instantMove = false;
        }
    });
    
}