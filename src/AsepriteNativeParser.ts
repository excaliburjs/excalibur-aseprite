import { Animation, AnimationStrategy, Color, Frame, ImageSource, Sprite, SpriteSheet } from "excalibur";
import { inflate } from 'pako';
import { AsepriteSpriteSheet } from "./AsepriteSpriteSheet";

export const AnimationTypes = {
    Forward: 0,
    Reverse: 1,
    PingPong: 2,
    PingPongReverse: 3
}

export interface AnimationTag {
    name: string;
    from: number;
    to: number;
    type: number;
    repeat: number;
}

export class AsepriteNativeParser {
    private _cursor = 0;
    private _frames: number = 0;
    private _dataView: DataView;
    private _exFrames: Frame[] = [];
    private _sprites: Sprite[] = [];
    private _tags: Map<string, AnimationTag> = new Map<string, AnimationTag>();
    private _canvasFrames: CanvasRenderingContext2D[] = [];
    public height: number = 0;
    public width: number = 0;
    constructor(public arraybuffer: ArrayBuffer) {
        this._dataView = new DataView(arraybuffer);
    }

    async parse() {
        this._parseHeader();

        // After parsing the header we know the dimension and the number of frames
        for (let i = 0; i < this._frames; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx!.imageSmoothingEnabled = false;
            this._canvasFrames.push(ctx!);
            await this._parseFrame(ctx!);
        }
    }

    public getAsepriteSheet() {
        return new AsepriteSpriteSheet(
            this.getSpriteSheet(),
            this.getAnimations()
        );
    }

    public getFrames(): Frame[] {
        return this._exFrames;
    }

    public getSpriteSheet(): SpriteSheet {
        const spriteSheet = new SpriteSheet({
            sprites: this._sprites
        })
        return spriteSheet;
    }

    public getAnimations(): Map<string, Animation> {
        const result = new Map<string, Animation>();
        for (let tag of this._tags.keys()) {
            result.set(tag, this.getAnimation(tag));
        }
        return result;
    }

    public getAnimation(name: string): Animation {
        const animationTag = this._tags.get(name);
        if (!animationTag) throw Error(`No animation by name [${name}] in aseprite file`);

        const frames = this._exFrames.slice(animationTag.from, animationTag.to + 1);

        const type = animationTag.type;
        let strategy = AnimationStrategy.End;
        if (type === AnimationTypes.Forward) {
            strategy = AnimationStrategy.End;
        } else if (type === AnimationTypes.PingPong || type === AnimationTypes.PingPongReverse) {
            strategy = AnimationStrategy.PingPong;
        }

        let reverse = false;
        if (type === AnimationTypes.Reverse || type === AnimationTypes.PingPongReverse) {
            reverse = true;
        }

        const animation = new Animation({
            frames: frames,
            strategy,
            reverse
        });
        return animation;
    }

    private async _parseFrame(ctx: CanvasRenderingContext2D) {
        const frameSize = this._readDWORD();
        const magicNumber = this._readWORD();
        const oldChunks = this._readWORD();
        const frameDurationMs = this._readWORD();
        this._readBYTE();
        this._readBYTE();
        const newChunks = this._readDWORD();

        const numChunks = newChunks === 0 ? oldChunks : newChunks;

        for (let i = 0; i < numChunks; i++) {
            // TODO parse chunk
            await this._parseChunk(ctx);
        }

        // After parsing the chunks I have the image information
        // TODO update excalibur so that we can make an ImageSource from a canvas
        const rawImage = ctx.canvas.toDataURL("image/png");
        const imageSource = new ImageSource(rawImage);
        await imageSource.load();
        const sprite = imageSource.toSprite();
        this._sprites.push(sprite);
        this._exFrames.push({
            duration: frameDurationMs,
            graphic: sprite
        })
    }

    private async _parseChunk(ctx: CanvasRenderingContext2D) {
        const startCursor = this._cursor;
        const size = this._readDWORD();
        const type = this._readWORD();
        // Old palette chunk 0x0004
        // Old palette chunk 0x0011
        // Layer chunk 0x2004
        // Cel Chunk 0x2005
        if (type === 0x2005) { // 8197
            const layerIndex = this._readWORD();
            const xPos = this._readSHORT();
            const yPos = this._readSHORT();
            const opacity = this._readBYTE();
            const cellType = this._readWORD();
            const zindex = this._readSHORT();
            this._advanceBytes(5);
            // raw image data
            if (cellType === 0) {
                const width = this._readWORD();
                const height = this._readWORD();
                let pixels: Color[] = [];
                for (let i = 0; i < width * height; i++) {
                    pixels.push(this._readPixel());
                }
            } else if (cellType === 2) {
                const width = this._readWORD();
                const height = this._readWORD();

                const currentCursor = this._cursor;
                const sizeToRead = size - (currentCursor - startCursor);
                const compressed = this._readBytes(sizeToRead);
                const decompressed = inflate(compressed);
                const data = new Uint8ClampedArray(decompressed);
                const imageData = new ImageData(data, width, height);
                const imageBitmap = await createImageBitmap(imageData)
                ctx.drawImage(imageBitmap, xPos, yPos);
            }
        }
        // Tags chunk 0x2018
        else if (type === 0x2018) {
            const numberOfTags = this._readWORD();
            this._advanceBytes(8);
            for (let i = 0; i < numberOfTags; i++) {
                const from = this._readWORD();
                const to = this._readWORD();
                const type = this._readBYTE();
                const repeat = this._readWORD();
                this._advanceBytes(6);
                // tag color ignore
                this._advanceBytes(3);
                this._advanceBytes(1);
                const name = this._readString();

                this._tags.set(name, {
                    name,
                    from,
                    to,
                    type,
                    repeat
                })
            }
        }
        // else if (type === 0x2007) {
        //     // Color profile 0x2007
        //     // Should 22 bytes???
        //     const type = this._readWORD();
        //     const flags = this._readDWORD();
        //     const gamma = this._readFixed();
        //     this._advanceBytes(8);
        //     if (type === 2) {
        //         const iccLength = this._readDWORD();
        //         // const iccProfileData = byte[]
        //         this._advanceBytes(iccLength);
        //     }
        // } 
        else {
            this._advanceBytes(size - 6);
        }
        // Extra Cel Chunk 0x2006
        // External files 0x2008
        // Mask chunk 0x2016 (Deprecated)
        // Path chunk 0x2017 (Not used)
        
        // Palette 0x2019
        // User data 0x2020
        // Slice 0x2022
        // Tileset 0x2023
        // Depending on the type do other stuff
    }

    private _parseHeader() {
        // https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
        const dataView = new DataView(this.arraybuffer);
        const fileSize = this._readDWORD();
        // TODO check magic number is 42464 in decimal 0xA5E0
        const magicNumber = this._readWORD();
        const frames = this._readWORD();
        this._frames = frames;

        this.width = this._readWORD();
        this.height = this._readWORD();

        const colorDepthBpp = this._readWORD();
        let colorDepth: 'RGBA' | 'Grayscale' | 'Indexed' = 'RGBA';
        if (colorDepthBpp === 32) {
            colorDepth = 'RGBA'
        } else if (colorDepthBpp === 16) {
            colorDepth = 'Grayscale'
        } else if (colorDepthBpp === 8) {
            colorDepth = 'Indexed'
        }

        const flags = this._readDWORD();

        const speedMs = this._readWORD(); // DEPRECATED

        // Empty reads per spec
        this._readDWORD();
        this._readDWORD();

        const transparentIndex = this._readBYTE();

        // ignore these bytes
        this._advanceBytes(3);

        const numberOfColors = this._readWORD();

        const pixelWidth = this._readBYTE();
        const pixelHeight = this._readBYTE();

        const xPosOfGrid = this._readSHORT();
        const yPosOfGrid = this._readSHORT();

        const gridWidth = this._readWORD();
        const gridHeight = this._readWORD();

        this._advanceBytes(84);
    }


    private _readString(): string {
        const length = this._readWORD();
        const stringBytes = this._readBytes(length);
        const decorder = new TextDecoder();
        const str = decorder.decode(stringBytes);
        return str;
    }

    private _readBytes(n: number): Uint8Array {
        const data = new Uint8Array(this.arraybuffer.slice(this._cursor, this._cursor + n));
        this._cursor += n;
        return data;
    }

    private _readPixel(): Color {
        const r = this._dataView.getInt16(this._cursor, true);
        this._cursor += 2;
        const g = this._dataView.getInt16(this._cursor, true);
        this._cursor += 2;
        const b = this._dataView.getInt16(this._cursor, true);
        this._cursor += 2;
        const a = this._dataView.getInt16(this._cursor, true);
        this._cursor += 2;
        return new Color(r, g, b, a/255);
    }

    private _readFixed(): number {
        // 16.16
        const whole = this._dataView.getUint16(this._cursor, true);
        this._cursor += 2;
        const decimal = this._dataView.getUint16(this._cursor, true);
        this._cursor += 2;
        return parseFloat(whole + "." + decimal);
    }

    private _readDWORD(): number {
        const data = this._dataView.getUint32(this._cursor, true);
        this._cursor += 4;
        return data;
    }

    private _readWORD(): number {
        const data = this._dataView.getUint16(this._cursor, true);
        this._cursor += 2;
        return data;
    }

    private _readSHORT(): number {
        const data = this._dataView.getInt16(this._cursor, true);
        this._cursor += 2;
        return data;
    }

    private _readBYTE(): number {
        const data = this._dataView.getUint8(this._cursor);
        this._cursor += 1;
        return data;
    }

    private _advanceBytes(n: number) {
        this._cursor += n;
    }
}