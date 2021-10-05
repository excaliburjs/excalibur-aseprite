export class AsepriteRaw {
    frames!: {
        [key: string]: { 
            frame: { x: number, y: number, w: number, h: number },
            rotated: boolean,
            trimmed: boolean,
            spriteSourceSize: { x: number, y: number, w: number, h: number },
            sourceSize: { w: number, h: number },
            duration: number
        }
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