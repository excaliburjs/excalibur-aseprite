import { AsepriteNativeParser } from "@excalibur-aseprite";
import { AnimationStrategy, ExcaliburGraphicsContext2DCanvas, Resource } from "excalibur";
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('A AsepriteNativeParser', () => {
    let canvas: HTMLCanvasElement;
    let context: ExcaliburGraphicsContext2DCanvas;
    beforeAll(() => {
        jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    })

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        context = new ExcaliburGraphicsContext2DCanvas({
            canvasElement: canvas
        });
    })

    it('exists', () => {
        expect(AsepriteNativeParser).toBeDefined();
    });

    it('can parse a RGBA native file with multiple animations', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-rgba-multi-animation.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-rgba.png');
    });

    it('can parse a RGBA native file and get an animation for all', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-rgba-multi-animation.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const allAnim = nativeParser.getAnimation();
        expect(allAnim.frames.length).toBe(3);
        expect(allAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(allAnim.width).toBe(64);
        expect(allAnim.height).toBe(64);

        context.clear();
        allAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-rgba.png');
    });

    it('can parse a RGBA native file with hidden layers', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-hidden-layer.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const allAnim = nativeParser.getAnimation();
        expect(allAnim.frames.length).toBe(3);
        expect(allAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(allAnim.width).toBe(64);
        expect(allAnim.height).toBe(64);

        context.clear();
        allAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-hidden-layer.png');
    });

    it('can parse a RGBA native file with multiple layers', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-rgba-multi-layer.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-rgba-layers.png');
    });

    it('can parse a Grayscale native file with multiple animations', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-grayscale-multi-animation.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-grayscale.png');
    });

    it('can parse a Grayscale native file with multiple layers', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-grayscale-multi-layer.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-grayscale-layers.png');
    });

    it('can parse an Indexed native file with multiple animations', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-indexed-multi-animation.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-rgba.png');
    });

    it('can parse an Indexed native file with multiple layers (opacity too)', async () => {
        // Load resource
        const resource = new Resource<ArrayBuffer>("./test/unit/beetle-indexed-multi-layer.aseprite", "arraybuffer", true);
        const arraybuffer = await resource.load();

        const nativeParser = new AsepriteNativeParser(arraybuffer);
        await nativeParser.parse();

        const loopAnim = nativeParser.getAnimation('Loop');
        expect(loopAnim.frames.length).toBe(3);
        expect(loopAnim.strategy).toBe(AnimationStrategy.PingPong);
        expect(loopAnim.width).toBe(64);
        expect(loopAnim.height).toBe(64);

        const otherAnim = nativeParser.getAnimation('Animation 2');
        expect(otherAnim.frames.length).toBe(2);
        expect(otherAnim.strategy).toBe(AnimationStrategy.Loop);
        expect(otherAnim.width).toBe(64);
        expect(otherAnim.height).toBe(64);

        context.clear();
        loopAnim.draw(context as any, 0, 0);
        context.flush();

        await expectAsync(canvas).toEqualImage('./test/unit/expected-index-layers.png');
    });
});