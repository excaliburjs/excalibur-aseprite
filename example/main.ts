import { Actor, Animation, DisplayMode, Engine, Loader, Sprite, vec } from "excalibur";
import { AsepriteResource } from "@excalibur-aseprite";

const game = new Engine({
    width: 600,
    height: 400,
    displayMode: DisplayMode.FitScreen
});

const asepriteSpriteSheet = new AsepriteResource('./beetle.aseprite?_=1234&w#stuff');
const asepriteJson = new AsepriteResource('./beetle.json');

const loader = new Loader([asepriteSpriteSheet, asepriteJson]);
game.start(loader).then(()=>{
    const a = new Actor({pos: vec(100, 100)});
    a.graphics.use(asepriteSpriteSheet.getAnimation('Loop') as Animation);

    const spritesheet = asepriteSpriteSheet.getSpriteSheet();
    const sprite = spritesheet?.getSprite(1, 0) as Sprite;

    const b = new Actor({pos: vec(200, 200)});
    b.graphics.use(sprite);


    const c = new Actor({pos: vec(300, 100)});
    const animAll = asepriteSpriteSheet.getAnimation()!
    animAll.speed = .1;
    c.graphics.use(animAll)

    const d = new Actor({pos: vec(400, 100)});
    const animAllJson = asepriteJson.getAnimation()!
    animAllJson.speed = .1;
    d.graphics.use(animAllJson);


    game.currentScene.add(a);
    game.currentScene.add(b);
    game.currentScene.add(c);
    game.currentScene.add(d);
});