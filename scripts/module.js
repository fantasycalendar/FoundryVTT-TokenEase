import { libWrapper } from "./lib/libWrapper/shim.js";
import configure_settings from "./settings.js";

Hooks.once('init', async function() {
    patch_TokenSetPosition();
    patch_TokenAnimateMovement();
    add_CanvasAnimation_Animate();
    patch_AnimatePromise();
    patch_AnimateFrame();
    console.log("Token Ease | Patched core functions");
    configure_settings();
    console.log("Token Ease | Ready to (pl)ease!");
});

function patch_TokenSetPosition() {
    libWrapper.register(
        "token-ease",
        "Token.prototype.setPosition",
        async function setPosition(x, y, {animate=true, animation={}}={}) {

            // Create a Ray for the requested movement
            let origin = this._movement ? this.position : this._validPosition,
                target = {x: x, y: y},
                isVisible = this.isVisible;

            // Create the movement ray
            let ray = new Ray(origin, target);

            // Update the new valid position
            this._validPosition = target;

            // Record the Token's new velocity
            this._velocity = this._updateVelocity(ray);

            // Update visibility for a non-controlled token which may have moved into the controlled tokens FOV
            this.visible = isVisible;

            // Conceal the HUD if it targets this Token
            if ( this.hasActiveHUD ) this.layer.hud.clear();

            // Either animate movement to the destination position, or set it directly if animation is disabled
            if ( animate ) await this.animateMovement(new Ray(this.position, ray.B), animation);
            else this.position.set(x, y);

            // If the movement took a controlled token off-screen, re-center the view
            if (this._controlled && isVisible) {
                let pad = 50;
                let gp = this.getGlobalPosition();
                if ((gp.x < pad) || (gp.x > window.innerWidth - pad) || (gp.y < pad) || (gp.y > window.innerHeight - pad)) {
                    canvas.animatePan(this.center);
                }
            }
            return this;

        },
        "OVERRIDE"
    );
}

function patch_TokenAnimateMovement() {
    libWrapper.register(
        "token-ease",
        "Token.prototype.animateMovement",
        async function animateMovement(ray, animation) {

            this._movement = ray;

            let duration = animation?.duration || game.settings.get("token-ease", "default-duration");
            let speed = animation?.speed || game.settings.get("token-ease", "default-speed");
            let ease = animation?.ease || game.settings.get("token-ease", "default-ease");

            // Default move speed 10 spaces per second
            const s = canvas.dimensions.size;
            speed = s * speed;
            duration = duration ? duration : (ray.distance * 1000) / speed;

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
                fog: emits && !this._controlled && (canvas.sight.sources.size > 0)
            }

            // Dispatch the animation function
            let animationName = `Token.${this.id}.animateMovement`;
            await CanvasAnimation.animate(attributes, {
                name: animationName,
                context: this,
                duration: duration,
                ontick: (dt, anim) => this._onMovementFrame(dt, anim, config),
                ease: ease
            });

            // Once animation is complete perform a final refresh
            if ( !config.animate ) this._animatePerceptionFrame({source: config.source, sound: config.sound});
            this._movement = null;

        },
        "OVERRIDE"
    );
}

function add_CanvasAnimation_Animate() {
    CanvasAnimation.prototype.constructor.animate = async function(attributes, {context, name, duration, ontick, ease} = {}){
        // Prepare attributes
        attributes = attributes.map(a => {
            a.delta = a.to - a.parent[a.attribute];
            a.done = 0;
            a.remaining = Math.abs(a.delta);
            return a;
        }).filter(a => a.delta !== 0);

        // Register the request function and context
        context = context || canvas.stage;

        ease = window.easeFunctions[ease] ?? window.easeFunctions["linear"];

        // Dispatch the animation request and return as a Promise
        return this._animatePromise(this._animateFrame, context, name, attributes, duration, ontick, ease);
    };
}

function patch_AnimatePromise() {
    libWrapper.register(
        "token-ease",
        "CanvasAnimation.prototype.constructor._animatePromise",
        async function _animateFrame(fn, context, name, attributes, duration, ontick, ease) {

            if (name) this.terminateAnimation(name);
            let animate;
            return new Promise((resolve, reject) => {
                animate = dt => fn(dt, resolve, reject, attributes, duration, ontick, ease);
                this.ticker.add(animate, context);
                if (name) this.animations[name] = {fn: animate, context, resolve};
            })
            .catch(err => {
                console.error(err)
            })
            .finally(() => {
                this.ticker.remove(animate, context);
                const isCompleted = name && (this.animations[name]?.fn === animate);
                if ( isCompleted ) delete this.animations[name];
            });

        },
        "OVERRIDE"
    );
}

function patch_AnimateFrame() {
    libWrapper.register(
        "token-ease",
        "CanvasAnimation.prototype.constructor._animateFrame",
        async function _animateFrame(deltaTime, resolve, reject, attributes, duration, ontick, ease) {

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
                        // Ease attribute instead
                        a.parent[a.attribute] = (a.to - a.delta) + ease(a.done / a.delta) * a.delta;
                    }
                }
                if (ontick) ontick(dt, attributes);
            } catch (err) {
                reject(err);
            }

            // Resolve the original promise once the animation is complete
            if (complete) resolve(true);

        },
        "OVERRIDE"
    );
}