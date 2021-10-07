import { AsepriteResource } from "@excalibur-aseprite";
import { AnimationStrategy, Logger } from "excalibur";

describe('An Aseprite Resource', () => {
    it('exists', () => {
        expect(AsepriteResource).toBeDefined();
    });

    it('can load a resource', async () => {
        const sut = new AsepriteResource('test/unit/beetle.json');
        await sut.load();

        expect(sut.isLoaded());
        expect(sut.image).toBeDefined();
        expect(sut.image.path).toBe('test/unit/beetle.png');
        expect(sut.rawAseprite).toBeDefined();
    });

    it('will log a warning if not yet loaded', () => {
        const sut = new AsepriteResource('test/unit/beetle.json');
        const logger = Logger.getInstance();
        spyOn(logger, 'warn');
        
        sut.getAnimation('Loop');
        sut.getSpriteSheet();

        expect(sut.isLoaded()).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith('AspriteResource must be loaded before .getAnimation() is called');
        expect(logger.warn).toHaveBeenCalledWith('AspriteResource must be loaded before .getSpriteSheet() is called');
    });

    it('will return a sprite sheet and animation after loaded', async () => {
        const sut = new AsepriteResource('test/unit/beetle.json');

        await sut.load();
        
        const anim = sut.getAnimation('Loop');
        const spriteSheet = sut.getSpriteSheet();
        expect(anim).toBeDefined();
        expect(anim?.frames.length).toBe(3);
        expect(anim?.strategy).toBe(AnimationStrategy.PingPong);
        expect(anim?.frames[0].duration).toBe(500);

        expect(spriteSheet).toBeDefined();
        expect(spriteSheet?.rows).toEqual(2);
        expect(spriteSheet?.columns).toEqual(2);
        expect(spriteSheet?.getSprite(0, 0)?.width).toBe(64);
        expect(spriteSheet?.getSprite(0, 0)?.height).toBe(64);
    });
});