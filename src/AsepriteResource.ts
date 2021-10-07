import { ImageSource, Loadable, Logger, Resource, SpriteSheet } from 'excalibur';
import { AsepriteRaw } from './AsepriteRaw';
import { AsepriteSpriteSheet } from './AsepriteSpriteSheet';


export class AsepriteResource implements Loadable<AsepriteSpriteSheet> {
    private _resource: Resource<AsepriteRaw>;
    public data!: AsepriteSpriteSheet;
    public rawAseprite!: AsepriteRaw;
    public image!: ImageSource;

    public convertPath: (originPath: string, relativePath: string) => string;
    constructor(path: string, public bustCache = false) {
        this._resource = new Resource(path, 'json', bustCache);
        this.convertPath = (originPath: string, relativePath: string) => {
            // Use absolute path if specified
            if (relativePath.indexOf('/') === 0) {
                return relativePath;
            }

            const originSplit = originPath.split('/');
            const relativeSplit = relativePath.split('/');
            // if origin path is a file, remove it so it's a directory
            if (originSplit[originSplit.length - 1].includes('.')) {
                originSplit.pop();
            }
            return originSplit.concat(relativeSplit).join('/');
        }
    }

    public async load(): Promise<AsepriteSpriteSheet> {
        const asepriteData = await this._resource.load();
        const imagepath = this.convertPath(this._resource.path, asepriteData.meta.image);
        const spriteSheetImage = new ImageSource(imagepath, this.bustCache);
        await spriteSheetImage.load();
        this.rawAseprite = asepriteData;
        this.image = spriteSheetImage;
        return this.data = new AsepriteSpriteSheet(asepriteData, spriteSheetImage);
    }

    public getSpriteSheet() {
        if (this.isLoaded()) {
            return this.data.getSpriteSheet();
        } else {
            Logger.getInstance().warn('AspriteResource must be loaded before .getSpriteSheet() is called');
        }
    }

    public getAnimation(name: string) {
        if (this.isLoaded()) {
            return this.data.getAnimation(name);
        } else {
            Logger.getInstance().warn('AspriteResource must be loaded before .getAnimation() is called');
        }
    }


    isLoaded(): boolean {
        return !!this.data;
    }
}