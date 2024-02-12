import { ImageSource, Loadable, Logger, Resource, SpriteSheet, Animation } from 'excalibur';
import { AsepriteRawJson } from './AsepriteRawJson';
import { AsepriteSpriteSheet } from './AsepriteSpriteSheet';
import { AsepriteNativeParser } from './AsepriteNativeParser';
import { AsepriteJsonParser } from './AsepriteJsonParser';


export class AsepriteResource implements Loadable<AsepriteSpriteSheet> {
    private _path: string;
    private _type: 'native' | 'json' = 'native';
    private _jsonResource: Resource<AsepriteRawJson> | undefined;
    private _jsonParser: AsepriteJsonParser | undefined;
    private _nativeResource: Resource<ArrayBuffer>| undefined;
    private _nativeParser: AsepriteNativeParser | undefined;
    public data!: AsepriteSpriteSheet;
    public convertPath: (originPath: string, relativePath: string) => string;

    private _hasFileExtension(path: string, extension: string) {
        const fileExtension = /.*\.([A-Za-z0-9]+)(?:(?:\?|\#).*)*$/;
        if (path) {
            const ext = path.match(fileExtension);
            if (ext?.length) {
                return ext[1] === extension;
            }
        }
        return false;
    }
    constructor(path: string, public bustCache = false) {
        this._path = path;
        // if this is a .ase/.aseprite download as an arraybuffer 
        if (this._hasFileExtension(path, 'ase')  || this._hasFileExtension(path, 'aseprite')) {
            this._nativeResource = new Resource<ArrayBuffer>(path, "arraybuffer", bustCache);
            this._type = 'native';
        } else {
            this._jsonResource = new Resource(path, 'json', bustCache);
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
        if (this._type === 'json' && this._jsonResource) {
            const asepriteData = await this._jsonResource.load();
            const imagepath = this.convertPath(this._jsonResource.path, asepriteData.meta.image);
            const spriteSheetImage = new ImageSource(imagepath, this.bustCache);
            await spriteSheetImage.load();

            this._jsonParser = new AsepriteJsonParser(asepriteData, spriteSheetImage);
            this._jsonParser.parse();

            return this.data = this._jsonParser.getAsepriteSheet();
        } else {
            // type is 'native'
            const arraybuffer = await this._nativeResource?.load();

            if (arraybuffer) {
                this._nativeParser = new AsepriteNativeParser(arraybuffer);
    
                await this._nativeParser.parse();
            } else {
                throw Error(`Could not load aseprite resource ${this._path}`);
            }

            return this.data = this._nativeParser.getAsepriteSheet();
        }
    }

    public getSpriteSheet() {
        if (this.isLoaded()) {
            return this.data.getSpriteSheet();
        } else {
            Logger.getInstance().warn('AsepriteResource must be loaded before .getSpriteSheet() is called');
        }
    }

    public getAnimation(name: string): Animation | null {
        if (this.isLoaded()) {
            if (this._type === 'json'){
                return this.data.getAnimation(name);
            } else {
                return this._nativeParser!.getAnimation(name);
            }
        } else {
            Logger.getInstance().warn('AsepriteResource must be loaded before .getAnimation() is called');
        }
        return null;
    }

    public clone() {
        const clone = new AsepriteResource(this._path, this.bustCache);
        clone.data = this.data.clone();

        return clone;
    }

    isLoaded(): boolean {
        return !!this.data;
    }
}