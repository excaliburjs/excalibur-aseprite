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

export interface LayerData {
    name: string;
    opacity: number;
    visible: boolean;
}

/**
 * Parses native aseprite file format
 * Format documented from https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
 */
export class AsepriteNativeParser {
    private _cursor = 0;
    private _colorDepth: 'RGBA' | 'Grayscale' | 'Indexed' = 'RGBA';
    private _transparentIndex = 0;
    private _frames: number = 0;
    private _dataView: DataView;
    private _exFrames: Frame[] = [];
    private _sprites: Sprite[] = [];
    private _tags: Map<string, AnimationTag> = new Map<string, AnimationTag>();
    private _canvasFrames: CanvasRenderingContext2D[] = [];
    private _indexedColors = new Map<number, Color>();
    private _currentLayer = 0;
    private _layerData = new Map<number, LayerData>();
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

    /**
     * Optionally get an animation by name
     * @param name
     * @returns
     */
    public getAnimation(name?: string): Animation {

        let type = AnimationTypes.Forward;
        let frames: Frame[];
        if (name) {
            const animationTag = this._tags.get(name);
            if (!animationTag) throw Error(`No animation by name [${name}] in aseprite file`);
            frames = this._exFrames.slice(animationTag.from, animationTag.to + 1);
            type = animationTag.type;
        } else {
            frames = this._exFrames;
        }

        let strategy = AnimationStrategy.Loop;
        if (type === AnimationTypes.PingPong || type === AnimationTypes.PingPongReverse) {
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
            await this._parseChunk(ctx);
        }

        // After parsing the chunks we have the image information for the frame
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
        
        // Cel Chunk 0x2005
        if (type === 0x2005) { // 8197
            const layerIndex = this._readWORD();
            const layerData = this._layerData.get(layerIndex);
            const xPos = this._readSHORT();
            const yPos = this._readSHORT();
            const opacity = this._readBYTE();
            const cellType = this._readWORD();
            const zindex = this._readSHORT();
            this._advanceBytes(5);
            // raw image data
            if (cellType === 0) {
                // Unused according to the spec
                throw Error('Unexpected raw image data');
            // Linked cell
            } else if (cellType === 1) {
                const framePosition = this._readWORD();
                // Copy the linked frame into this context
                const linkedFrame = this._canvasFrames[framePosition];
                if (layerData?.visible) {
                    ctx.save()
                    ctx.drawImage(linkedFrame.canvas, 0, 0);
                    ctx.restore();
                }
            // Compressed image data
            } else if (cellType === 2) {
                const width = this._readWORD();
                const height = this._readWORD();

                const currentCursor = this._cursor;
                const sizeToRead = size - (currentCursor - startCursor);
                const compressed = this._readBytes(sizeToRead);
                const decompressed = inflate(compressed);
                const transformed = this._transformImageDataToRGBA(decompressed);
                const data = new Uint8ClampedArray(transformed);
                const imageData = new ImageData(data, width, height);
                const imageBitmap = await createImageBitmap(imageData);
                if (layerData?.visible) {
                    ctx.save();
                    ctx.globalAlpha = (opacity/255) * (layerData?.opacity ?? 255)/255;
                    ctx.drawImage(imageBitmap, xPos, yPos);
                    ctx.restore();
                }
            // Compressed tilemap
            } else if (cellType === 3) {
                // TODO tilemap support
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
        // Palette 0x2019
        else if (type === 0x2019) {
            const paletteSize = this._readDWORD();
            const firstIndex = this._readDWORD();
            const lastIndex = this._readDWORD();
            this._readBytes(8);
            // + For each palette entry in [from,to] range (to-from+1 entries)
            for (let i = firstIndex; i < (lastIndex - firstIndex + 1); i++) {
                const entryFlags = this._readWORD();
                const red = this._readBYTE();
                const green = this._readBYTE();
                const blue = this._readBYTE();
                const alpha = this._readBYTE();
                this._indexedColors.set(i, new Color(red, green, blue, alpha/255));
                if (entryFlags === 1) {
                    const name = this._readString();
                }
            }
        }
        // Layer chunk 0x2004
        else if (type === 0x2004) {
            const flags = this._readWORD();
            const visible = (flags & 0x1) === 1;
            const layerType = this._readWORD();
            const layerChild = this._readWORD();
            const defaultLayerWidth = this._readWORD(); // ignored
            const defaultLayerHeight = this._readWORD(); // ignored
            const blendMode = this._readWORD();
            const opacity = this._readBYTE();
            this._advanceBytes(3);
            const name = this._readString();
            if (layerType === 2) {
                const tilesetIndex = this._readDWORD();
            }
            this._layerData.set(this._currentLayer++, {
                name,
                opacity,
                visible
            })
        }


        // Currently unsupported chunks

        // Old palette chunk 0x0004
        // Old palette chunk 0x0011
        
        // Color profile 0x2007
        // Extra Cel Chunk 0x2006
        // External files 0x2008
        // Mask chunk 0x2016 (Deprecated)
        // Path chunk 0x2017 (Not used)
        // User data 0x2020
        // Slice 0x2022
        // Tileset 0x2023
        else {
            this._advanceBytes(size - 6);
        }
    }

    private _parseHeader() {
        // https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
        const fileSize = this._readDWORD();
        const magicNumber = this._readWORD();
        if (magicNumber !== 0xA5E0) {
            throw Error('Aseprite file corrupted! Header invalid')
        }
        const frames = this._readWORD();
        this._frames = frames;

        this.width = this._readWORD();
        this.height = this._readWORD();

        const colorDepthBpp = this._readWORD();
        if (colorDepthBpp === 32) {
            this._colorDepth = 'RGBA'
        } else if (colorDepthBpp === 16) {
            this._colorDepth = 'Grayscale'
        } else if (colorDepthBpp === 8) {
            this._colorDepth = 'Indexed'
        }

        const flags = this._readDWORD();

        const speedMs = this._readWORD(); // DEPRECATED

        // Empty reads per spec
        this._readDWORD();
        this._readDWORD();

        const transparentIndex = this._readBYTE();
        this._transparentIndex = transparentIndex;

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

    private _transformImageDataToRGBA(data: Uint8Array) {
        if (this._colorDepth === 'Grayscale') {
            const numPixels = (data.byteLength / 2) * 4;
            const resultPixels = new Uint8Array(numPixels);
            for (let i = 0; i < numPixels; i += 4) {
                const source = Math.floor(i / 4) * 2;
                resultPixels[i + 0] = data[source + 0];
                resultPixels[i + 1] = data[source + 0];
                resultPixels[i + 2] = data[source + 0];
                resultPixels[i + 3] = data[source + 1];
            }
            return resultPixels;
        } else if (this._colorDepth === 'Indexed') {
            const numPixels = data.byteLength * 4;
            const resultPixels = new Uint8Array(numPixels);
            for (let i = 0;  i < numPixels; i += 4) {
                const source = Math.floor(i / 4);
                let color = Color.Transparent;
                if (data[source] === this._transparentIndex) {
                    color = Color.Transparent;
                } else {
                    color = this._indexedColors.get(data[source]) ?? Color.Transparent;
                }
                resultPixels[i + 0] = color.r;
                resultPixels[i + 1] = color.g;
                resultPixels[i + 2] = color.b;
                resultPixels[i + 3] = Math.ceil(color.a * 255);
            }
            return resultPixels;
        }
        return data;
    }


    private _readString(): string {
        const length = this._readWORD();
        const stringBytes = this._readBytes(length);
        const decoder = new TextDecoder();
        const str = decoder.decode(stringBytes);
        return str;
    }

    private _readBytes(n: number): Uint8Array {
        const data = new Uint8Array(this.arraybuffer.slice(this._cursor, this._cursor + n));
        this._cursor += n;
        return data;
    }

    private _readPixel(): Color {
        // RGBA BYTE[4]
        // Grayscale BYTE[2]
        // Indexed BYTE
        if (this._colorDepth === 'RGBA') {
            const r = this._dataView.getInt16(this._cursor, true);
            this._cursor += 2;
            const g = this._dataView.getInt16(this._cursor, true);
            this._cursor += 2;
            const b = this._dataView.getInt16(this._cursor, true);
            this._cursor += 2;
            const a = this._dataView.getInt16(this._cursor, true);
            this._cursor += 2;
            return new Color(r, g, b, a/255);
        } else if (this._colorDepth === 'Grayscale') {
            const value = this._readBYTE();
            const alpha = this._readBYTE();
            return new Color(value, value, value, alpha/255);
        } else if (this._colorDepth === 'Indexed') {
            const index = this._readBYTE();
            return this._indexedColors.get(index) ?? Color.Transparent;
        }
        return Color.Transparent;
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