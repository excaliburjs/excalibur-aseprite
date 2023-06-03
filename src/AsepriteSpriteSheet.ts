import { SpriteSheet, Animation } from "excalibur";


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
        const newAnimations = new Map<string, Animation>();
        for (let [key, value] of this._animations.entries()) {
            newAnimations.set(key, value.clone());
        }
        const newSpriteSheet = new SpriteSheet({
            sprites: this._spriteSheet.sprites,
            rows: this._spriteSheet.rows,
            columns: this._spriteSheet.columns
        });
        const spriteSheet = new AsepriteSpriteSheet(newSpriteSheet, newAnimations);
        return spriteSheet;
    }
}