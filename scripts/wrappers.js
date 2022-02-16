import CONSTANTS from "./constants.js";
import { libWrapper } from "./lib/libWrapper/shim.js";

export function coreAnimateMovement(){

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype.animateMovement", async function animateMovement(ray) {

            this._movement = ray;
            let animation = this.document.getFlag(CONSTANTS.MODULE_NAME, CONSTANTS.ANIMATION_FLAG);

            // Move distance is 10 spaces per second
            const speed = canvas.dimensions.size * (animation?.speed || 10);
            const duration = animation?.duration || (ray.distance * 1000) / speed;

            // Define attributes
            const attributes = [
                { parent: this, attribute: 'x', to: ray.B.x },
                { parent: this, attribute: 'y', to: ray.B.y }
            ];

            // Determine what type of updates should be animated
            const emits = this.emitsLight;
            const config = {
                animate: game.settings.get("core", "visionAnimation"),
                source: this._isVisionSource() || emits,
                sound: this._controlled || this.observer,
                forceUpdateFog: emits && !this._controlled && (canvas.sight.sources.size > 0)
            }

            // Dispatch the animation function
            await CanvasAnimation.animateLinear(attributes, {
                name: this.movementAnimationName,
                context: this,
                duration: duration,
                ontick: (dt, anim) => this._onMovementFrame(dt, anim, config)
            });

            // Once animation is complete perform a final refresh
            if ( !config.animate ) this._animatePerceptionFrame({source: config.source, sound: config.sound});
            this._movement = null;
        },
        "OVERRIDE"
    );
}

export function coreTerminateAnimation() {
    libWrapper.register(CONSTANTS.MODULE_NAME, 'CanvasAnimation.terminateAnimation', function terminateAnimation(wrapper, ...args) {
        const [name] = args; // Added by Hooking Tokens.

        if (!name.includes("Token")) return wrapper(...args) // Added by Hooking Tokens.

        let animation = this.animations[name];
        if (animation) animation.terminate = true; // Added by Hooking Tokens.
    }, 'MIXED')
}

export function coreRulerMoveToken() {
    libWrapper.register(CONSTANTS.MODULE_NAME, 'Ruler.prototype.moveToken', async function preRulerMove(wrapper) {
        const token = this._getMovementToken();
        if (!token) return wrapper();

        const allowed = Hooks.call('preTokenChainMove', token, this);
        if (!allowed) {
            console.log("Token movement prevented by 'preTokenChainMove' hook.");
            this.destination = null;
            this._endMeasurement();
        }

        return wrapper();
    }, 'WRAPPER');
}


export function coreTokenAnimateLinear() {
    libWrapper.register(CONSTANTS.MODULE_NAME, 'CanvasAnimation.animateLinear', function preAnimateLinearHook(wrapper, ...args) {
        const [attributes, fnData] = args;
        let {context, name, duration, ontick} = fnData;

        if (!(context instanceof Token)) return wrapper(...args);

        let data = {
            duration: duration,
            config: {
                animate: game.settings.get("core", "visionAnimation"),
                source: context._isVisionSource() || context.emitsLight,
                sound: context._controlled || context.observer,
                forceUpdateFog: context.emitsLight && !context._controlled && (canvas.sight.sources.size > 0)
            },
            ontick: null
        }
        data.ontick = (dt, anim) => context._onMovementFrame(dt, anim, data.config)

        Hooks.call('preTokenAnimate', context, data)

        return wrapper(attributes, {
            context: context,
            name: name,
            duration: data.duration,
            ontick: data.ontick
        });
    }, 'WRAPPER');
}

export function coreAnimatePromise() {
    libWrapper.register(CONSTANTS.MODULE_NAME, 'CanvasAnimation._animatePromise', async function animatePromise(wrapper, ...args) {
        const attributes = args[3];
        const token = attributes[0]?.parent;
        await wrapper(...args);
        if ((token instanceof Token)) Hooks.callAll('tokenAnimationComplete', token);
    }, 'WRAPPER');
}

export function coreAnimateFrame() {
    libWrapper.register(CONSTANTS.MODULE_NAME, 'CanvasAnimation._animateFrame', function animateFrame(...args) {

        let [deltaTime, resolve, reject, attributes, duration, ontick] = args;

        let ease = window.easeFunctions["linear"];

        const target = attributes[0]?.parent;
        if (target instanceof Token) {
            const animationName = target.movementAnimationName;
            if (CanvasAnimation.animations[animationName]?.terminate) {
                Hooks.callAll('tokenAnimationTerminated', attributes);
                return resolve(true);
            }

            if(target.document) {
                let tokenEase = target.document.getFlag(CONSTANTS.MODULE_NAME, CONSTANTS.ANIMATION_FLAG)?.ease;
                if(window.easeFunctions[tokenEase]){
                    ease = window.easeFunctions[tokenEase];
                }
            }
        }

        let complete = attributes.length === 0;
        let dt = (duration * PIXI.settings.TARGET_FPMS) / deltaTime;

        // Update each attribute
        try {
            for (let a of attributes) {
                let da = a.delta / dt;
                a.d = da;
                if (a.remaining < (Math.abs(da) * 1.25)) {
                    a.parent[a.attribute] = a.to;
                    a.done = a.delta;
                    a.remaining = 0;
                    complete = true;
                } else {
                    a.parent[a.attribute] += da;
                    a.done += da;
                    a.remaining = Math.abs(a.delta) - Math.abs(a.done);
                    a.parent[a.attribute] = (a.to - a.delta) + ease(a.done / a.delta) * a.delta;
                }
            }
            if (ontick) ontick(dt, attributes);
        } catch (err) {
            reject(err);
        }

        // Resolve the original promise once the animation is complete
        if (complete) resolve(true);

    }, 'OVERRIDE');
}