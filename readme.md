
https://www.aseprite.org/docs/cli/#format

`seprite -b sprite.ase --format json-array --data spritesheet.json --sheet spritesheet.png`

```typescript
{ "frames": [
   {
    "filename": "sprite 0.ase",
    "frame": { "x": 0, "y": 0, "w": 256, "h": 256 },
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
    "sourceSize": { "w": 256, "h": 256 },
    "duration": 100
   },
   {
    "filename": "sprite 1.ase",
    "frame": { "x": 256, "y": 0, "w": 256, "h": 256 },
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
    "sourceSize": { "w": 256, "h": 256 },
    "duration": 200
   },
   {
    "filename": "sprite 2.ase",
    "frame": { "x": 512, "y": 0, "w": 256, "h": 256 },
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
    "sourceSize": { "w": 256, "h": 256 },
    "duration": 100
   }
 ],
 "meta": {
  "app": "http://www.aseprite.org/",
  "version": "1.2-dev",
  "format": "RGBA8888",
  "size": { "w": 768, "h": 256 },
  "scale": "1"
 }
}
```