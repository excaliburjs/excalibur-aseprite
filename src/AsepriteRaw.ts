import { AsepriteRawFrame } from './AsepriteRawFrame';

export class AsepriteRaw {
    frames!: {
        [key: string]: AsepriteRawFrame,
    }
    meta!: {
        image: string,
        size: { w: number, h: number },
        scale: number,
        format: string,
        layers: { name: string, opacity: number, blendMode: string }[],
        frameTags: { name: string, from: number, to: number, direction: string}[],
        slices: any[]
    }
}