import { ImageSource, Loadable, Logger, Resource, SpriteSheet, Animation } from 'excalibur';
import { AsepriteRaw } from './AsepriteRaw';
import { AsepriteSpriteSheet } from './AsepriteSpriteSheet';
import { AsepriteNativeParser } from './AsepriteNativeParser';


export class AsepriteResource implements Loadable<AsepriteSpriteSheet> {
    private _path: string;
    private _type: 'native' | 'json' = 'native';
    private _resource: Resource<AsepriteRaw> | undefined;
    private _nativeResource: Resource<ArrayBuffer>| undefined;
    public data!: AsepriteSpriteSheet;
    public rawAseprite!: AsepriteRaw;
    public image!: ImageSource;

    private _nativeParser: AsepriteNativeParser | undefined;

    public convertPath: (originPath: string, relativePath: string) => string;
    constructor(path: string, public bustCache = false) {
        this._path = path;
        // if this is a .ase/.aseprite download as an arraybuffer 
        // fixme: endsWith is problematic for paths that end with a querystring or hash
        if (path.endsWith('.ase') || path.endsWith('.aseprite')) {
            this._nativeResource = new Resource<ArrayBuffer>(path, "arraybuffer", bustCache);
            this._type = 'native';
        } else {
            this._resource = new Resource(path, 'json', bustCache);
            this._type = 'json';
        }

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
        if (this._type === 'json' && this._resource) {
            const asepriteData = await this._resource.load();
            const imagepath = this.convertPath(this._resource.path, asepriteData.meta.image);
            const spriteSheetImage = new ImageSource(imagepath, this.bustCache);
            await spriteSheetImage.load();
            this.rawAseprite = asepriteData;
            this.image = spriteSheetImage;
            return this.data = new AsepriteSpriteSheet(asepriteData, spriteSheetImage);
        } else {
            // type is 'native'
            const arraybuffer = await this._nativeResource?.load();

            if (arraybuffer) {
                this._nativeParser = new AsepriteNativeParser(arraybuffer);
    
                await this._nativeParser.parse();
            }

            const frames = this._nativeParser!.getFrames();

            // FIXME
            return this.data = new AsepriteSpriteSheet({
                frames: {
                    0 : {
                        frame: { x: 0, y: 0, w: 64, h: 64 },
                        rotated: false,
                        trimmed: false,
                        spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 },
                        sourceSize: { w: 64, h: 64 },
                        duration: 500
                    }
                },
                meta: {
                    image: 'tbd',
                    size: { w: 0, h: 0 },
                    scale: 1,
                    format: 'string',
                    layers: [],
                    frameTags: [],
                    slices: []
                }
            }, null as unknown as ImageSource); 
        }
    }

    public getSpriteSheet() {
        if (this.isLoaded()) {
            return this.data.getSpriteSheet();
        } else {
            Logger.getInstance().warn('AspriteResource must be loaded before .getSpriteSheet() is called');
        }
    }

    public getAnimation(name: string): Animation | null {
        if (this.isLoaded()) {
            if (this._type === 'json'){
                return this.data.getAnimation(name);
            } else {
                return new Animation({ frames: this._nativeParser!.getFrames() });
            }
        } else {
            Logger.getInstance().warn('AspriteResource must be loaded before .getAnimation() is called');
        }
        return null;
    }

    public clone() {
        const clone = new AsepriteResource(this._path, this.bustCache);
        clone.data = this.data.clone();
        clone.rawAseprite = this.rawAseprite;
        clone.image = this.image;

        return clone;
    }

    isLoaded(): boolean {
        return !!this.data;
    }
}