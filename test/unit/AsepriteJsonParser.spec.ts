import { AsepriteJsonParser, AsepriteRawJson, AsepriteSpriteSheet } from "@excalibur-aseprite";
import { AnimationStrategy, ImageSource, Sprite } from "excalibur";

describe('An AsepriteJsonParser', () => {
    it('exists', () => {
        expect(AsepriteJsonParser).toBeDefined();
    });

    it('parses multiple aseprite animations', () => {
        const raw: AsepriteRawJson = {
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
        // TODO move to a new test
        const parser = new AsepriteJsonParser(raw, new ImageSource('./path/to/some/image'));
        parser.parse();
        const aseprite = parser.getAsepriteSheet();

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

        const allAnim = aseprite.getAnimation();
        const frameAllAnim = allAnim.frames[0].graphic as Sprite
        expect(anim3.frames.length).toBe(3);
        expect(frameAllAnim.sourceView.x).toBe(0);
        expect(allAnim.strategy).toBe(AnimationStrategy.Loop);
    });

    it('can clone', () => {
        const raw: AsepriteRawJson = {
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


        const parser = new AsepriteJsonParser(raw, new ImageSource('./path/to/some/image'));
        parser.parse();
        const aseprite = parser.getAsepriteSheet();

        const clone = aseprite.clone();

        expect(clone).toBeDefined();
        expect(clone).not.toBe(aseprite);
        expect(clone.getAnimation('anim1')).not.toBe(aseprite.getAnimation('anim1'));
    })
});