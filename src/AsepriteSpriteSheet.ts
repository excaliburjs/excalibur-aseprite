import { Frame, ImageSource, range, Sprite, SpriteSheet, Animation, AnimationStrategy } from "excalibur";
import { AsepriteRawJson } from "./AsepriteRawJson";


export class AsepriteSpriteSheet {
    private _spriteSheet!: SpriteSheet;
    private _animations = new Map<string, Animation>()

    constructor(spriteSheet: SpriteSheet, animations: Map<string, Animation>) {
        this._spriteSheet = spriteSheet;
        this._animations = animations;
    }

    getSpriteSheet(): SpriteSheet {
        return this._spriteSheet
    }

    getAnimation(name: string): Animation {
        if (!this._animations.has(name)) {
            throw new Error(`No animation exists with name ${name}, check your exported Aseprite file`);
        }
        return this._animations.get(name) as Animation;
    }

    clone() {
        const spriteSheet = new AsepriteSpriteSheet(this._spriteSheet, this._animations);
        return spriteSheet;
    }
}