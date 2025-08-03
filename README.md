# Notice - Due to a decision made by the Foundry devs, Token Ease is no longer able to function in Foundry. [Please read more here](https://github.com/fantasycalendar/FoundryVTT-TokenEase/issues/21).

# Token Ease

![Custom movement easing and speed](images/token-ease.gif)

---

![Latest Release Download Count](https://img.shields.io/github/downloads/fantasycalendar/FoundryVTT-TokenEase/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftoken-ease&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=token-ease) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2Ffantasycalendar%2FFoundryVTT-TokenEase%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) ![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2Ffantasycalendar%2FFoundryVTT-TokenEase%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

---

<img src="https://app.fantasy-calendar.com/resources/computerworks-logo-full.png" alt="Fantasy Computerworks Logo" style="width:250px;"/>

A module made by Fantasy Computerworks.

Other works by us:
- [Fantasy Calendar](https://app.fantasy-calendar.com) - The best calendar creator and management app on the internet
- [Sequencer](https://foundryvtt.com/packages/sequencer) - Wow your players by playing visual effects on the canvas
- [Item Piles](https://foundryvtt.com/packages/item-piles) - Drag & drop items into the scene to drop item piles that you can then easily pick up
- [Potato Or Not](https://foundryvtt.com/packages/potato-or-not) - Automatically set up Foundry to the best visual settings for your players' potato computers
- [Tagger](https://foundryvtt.com/packages/tagger) - Tag objects in the scene and retrieve them with a powerful API

Like what we've done? Buy us a coffee!

<a href='https://ko-fi.com/H2H2LCCQ' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

---

## What is this?

This module changes Foundry token animation behavior to introduce customizable animations. You can configure custom easing, custom movement speed, and movement duration to tokens.

No more will you suffer the lethargic slog of transporting tokens across the canvas!

## Credits

* Kerrec Snowmane for his implementation of the hooks
* League of Extraordinary FoundryVTT Developers
* [Easing Functions Cheat Sheet](https://easings.net/) ([GitHub](https://github.com/ai/easings.net)) - Copyright © 2020 Andrey Sitnik and Ivan Solovev

## Download Here:

`https://github.com/fantasycalendar/FoundryVTT-TokenEase/releases/latest/download/module.json`


## Module Settings

In the module settings, you can set the following options:

![Module settings](images/settings.png)

### Token Movement Speed

#### Default: 6

This sets the default animation speed of moving tokens, in spaces per second (6 is Foundry default).

### Token Movement Duration

#### Default: 0

This sets the default animation duration for token movement (in milliseconds).

This overrides **Token Movement Speed**, and causes tokens to reach their destination in a set amount of time, regardless of distance.

### Token Movement Ease

#### Default: Linear

This sets the type of ease used by the movement animation on tokens.

### Ease In/Out

#### Default: In & Out

This sets the type of easing to use at the start/end of the animation. If Token Movement Ease is set to Linear, this has no impact.

### Play animation on keypad movement

#### Default: False

If enabled, this will make moving tokens with the movement keys (arrow keys, etc) to play the animations configured above.

We do not recommend enabling this, as the movement distance is so short when using movement keys.

## Token Settings

Each token can override the module's default movement animation settings.

![Token settings](images/token_settings.png)

## API

### `TokenDocument#update`

As of Foundry v10, this natively accepts an additional optional parameter in its second parameter called `animation`:

```js
token.document.update({
     x: ..., y: ...
}, {animate: true, animation: { movementSpeed: 10, duration: 0, easing: "linear" }})
```

| Param         | Type | Default |
|---------------| --- | --- |
| movementSpeed | <code>number</code> | `10` |
| duration      | <code>number</code> | `0` |
| easing        | <code>string</code> | `linear` |

If `speed` or `duration` is given in the `animation` parameter, it will override the settings (see [module settings](#module-settings)).

If `duration` is provided, `speed` has no impact on the animation, as the token will reach the destination within the given duration.

If you change `easing`, it is recommended you use the ones below.

---

### `CanvasAnimation`

Token Ease adds multiple easing functions to Foundry's `CanvasAnimation` interface:

* `linear`
* `easeInSine`
* `easeOutSine`
* `easeInOutSine`
* `easeInQuad`
* `easeOutQuad`
* `easeInOutQuad`
* `easeInCubic`
* `easeOutCubic`
* `easeInOutCubic`
* `easeInQuart`
* `easeOutQuart`
* `easeInOutQuart`
* `easeInQuint`
* `easeOutQuint`
* `easeInOutQuint`
* `easeInExpo`
* `easeOutExpo`
* `easeInOutExpo`
* `easeInCirc`
* `easeOutCirc`
* `easeInOutCirc`
* `easeInBack`
* `easeOutBack`
* `easeInOutBack`
* `easeInElastic`
* `easeOutElastic`
* `easeInOutElastic`
* `easeInBounce`
* `easeOutBounce`
* `easeInOutBounce`
