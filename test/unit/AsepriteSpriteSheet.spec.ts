import { AsepriteRaw, AsepriteSpriteSheet } from "@excalibur-aseprite";
import { AnimationStrategy, ImageSource, Sprite } from "excalibur";

describe('An AsepriteSpriteSheet Parser', () => {
    it('exists', () => {
        expect(AsepriteSpriteSheet).toBeDefined();
    });

    it('parses multiple aseprite animations', () => {
        const raw: AsepriteRaw = {
            meta: {
                image: './path/to/image',
                size: { w: 20, h: 20 },
                scale: 1,
                format: 'RGBA8888',
                layers: [],
                frameTags: [
                    { name: "anim1", from: 0, to: 1, direction: "forward"},
                    { name: "anim2", from: 1, to: 2, direction: "reverse"},
                    { name: "anim3", from: 0, to: 2, direction: "pingpong"}
                ],
                slices: []
            },
            frames: {
                "frame1": {
                    frame: { x: 0, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: 10, h: 10 },
                    sourceSize: { w: 10, h: 10 },
                    duration: 500
                },
                "frame2": {
                    frame: { x: 10, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: 10, h: 10 },
                    sourceSize: { w: 10, h: 10 },
                    duration: 500
                },
                "frame3": {
                    frame: { x: 30, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: 10, h: 10 },
                    sourceSize: { w: 10, h: 10 },
                    duration: 500
                }
            }
        }

        const aseprite = new AsepriteSpriteSheet(raw, new ImageSource('./path/to/some/image'));

        const anim1 = aseprite.getAnimation('anim1');
        const frame2OfAnim1 = anim1.frames[1].graphic as Sprite
        expect(anim1.strategy).toBe(AnimationStrategy.Loop);
        expect(frame2OfAnim1.sourceView.x).toBe(10);
        expect(anim1.frames.length).toBe(2);

        const anim2 = aseprite.getAnimation('anim2');
        const frame1OfAnim2 = anim2.frames[0].graphic as Sprite
        expect(anim2.frames.length).toBe(2);
        expect(frame1OfAnim2.sourceView.x).toBe(30);
        
        const anim3 = aseprite.getAnimation('anim3');
        const frame1OfAnim3 = anim3.frames[0].graphic as Sprite
        expect(anim3.frames.length).toBe(3);
        expect(frame1OfAnim3.sourceView.x).toBe(0);
        expect(anim3.strategy).toBe(AnimationStrategy.PingPong);
    });

    it('can clone', () => {
        const raw: AsepriteRaw = {
            meta: {
                image: './path/to/image',
                size: { w: 20, h: 20 },
                scale: 1,
                format: 'RGBA8888',
                layers: [],
                frameTags: [
                    { name: "anim1", from: 0, to: 1, direction: "forward"},
                ],
                slices: []
            },
            frames: {
                "frame1": {
                    frame: { x: 0, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: 10, h: 10 },
                    sourceSize: { w: 10, h: 10 },
                    duration: 500
                }
            }
        }


        const aseprite = new AsepriteSpriteSheet(raw, new ImageSource('./path/to/some/image'));

        const clone = aseprite.clone();

        expect(clone).toBeDefined();
        expect(clone).not.toBe(aseprite);
        expect(aseprite.asepriteRaw).toEqual(clone.asepriteRaw);
        expect(aseprite.image).toEqual(clone.image);
        expect(clone.getAnimation('anim1')).not.toBe(aseprite.getAnimation('anim1'));
    })
});