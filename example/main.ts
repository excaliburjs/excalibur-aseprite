import { Actor, DisplayMode, Engine, Loader, vec } from "excalibur";
import { AsepriteResource } from "@excalibur-aseprite";

const game = new Engine({
    width: 600,
    height: 400,
    displayMode: DisplayMode.FitScreen
});

const asepriteSpriteSheet = new AsepriteResource('./beetle.json');

const loader = new Loader([asepriteSpriteSheet]);
game.start(loader).then(()=>{
    const a = new Actor({pos: vec(100, 100)});
    a.graphics.use(asepriteSpriteSheet.getAnimation('Loop') as any);
    game.currentScene.add(a);
});