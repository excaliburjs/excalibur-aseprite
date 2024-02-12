import { SpriteSheet, Animation } from "excalibur";


export class AsepriteSpriteSheet {
    private _spriteSheet!: SpriteSheet;

    constructor(spriteSheet: SpriteSheet, public animations: Map<string, Animation>) {
        this._spriteSheet = spriteSheet;
    }

    getSpriteSheet(): SpriteSheet {
        return this._spriteSheet
    }

    getAnimation(name: string): Animation {
        if (!this.animations.has(name)) {
            throw new Error(`No animation exists with name ${name}, check your exported Aseprite file`);
        }
        return this.animations.get(name) as Animation;
    }

    clone() {
        const newAnimations = new Map<string, Animation>();
        for (let [key, value] of this.animations.entries()) {
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