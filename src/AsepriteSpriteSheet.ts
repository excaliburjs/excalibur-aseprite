import { Frame, ImageSource, range, Sprite, SpriteSheet, Animation, AnimationStrategy } from "excalibur";
import { AsepriteRaw } from "./AsepriteRaw";


export class AsepriteSpriteSheet {
    private _spriteSheet: SpriteSheet;
    private _animations = new Map<string, Animation>()
    constructor(public asepriteRaw: AsepriteRaw, public image: ImageSource) {
        for (let frameTag of asepriteRaw.meta.frameTags) {
            let from = frameTag.from;
            let to = frameTag.to;
            let frameIndices = range(from, to);
            let frames: Frame[] = Object.values(asepriteRaw.frames)
            .filter((_, id) => {
                return frameIndices.includes(id);
            })
            .map(frame => ({
                duration: frame.duration,
                graphic: new Sprite({
                    image,
                    sourceView: {
                        x: frame.frame.x,
                        y: frame.frame.y,
                        width: frame.frame.w,
                        height: frame.frame.h
                    },
                    destSize: {
                        width: frame.frame.w,
                        height: frame.frame.h
                    }
                })
            }));
            let strategy = AnimationStrategy.Loop;
            switch(frameTag.direction) {
                case "pingpong": {
                    strategy = AnimationStrategy.PingPong
                    break;
                }
                case "reverse": {
                    frames.reverse();
                    break;
                }
            }
            this._animations.set(frameTag.name, new Animation({frames, strategy}));
        }

        const sprites: Sprite[] = [];
        for (let sprite of Object.values(asepriteRaw.frames)) {
            sprites.push(new Sprite({
                image,
                sourceView: {
                    x: sprite.frame.x,
                    y: sprite.frame.y,
                    width: sprite.frame.w,
                    height: sprite.frame.h
                }
            }));
        }
        this._spriteSheet = new SpriteSheet({
            sprites,
            rows: asepriteRaw.meta.size.h / sprites[0].height,
            columns: asepriteRaw.meta.size.w / sprites[0].width
        });
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
}