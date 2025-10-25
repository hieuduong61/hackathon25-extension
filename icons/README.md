# Extension Icons

This directory should contain the extension icons in PNG format at the following sizes:
- icon16.png (16x16 pixels)
- icon32.png (32x32 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

## Creating Icons

You can use the provided `icon.svg` file to generate PNG icons at different sizes.

### Option 1: Online Converter
1. Go to a website like https://cloudconvert.com/svg-to-png
2. Upload the `icon.svg` file
3. Convert to PNG at each required size
4. Save the files with the appropriate names

### Option 2: Using ImageMagick (Command Line)
```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 3: Using Inkscape (Command Line)
```bash
inkscape icon.svg -w 16 -h 16 -o icon16.png
inkscape icon.svg -w 32 -h 32 -o icon32.png
inkscape icon.svg -w 48 -h 48 -o icon48.png
inkscape icon.svg -w 128 -h 128 -o icon128.png
```

### Option 4: Create Your Own
Design custom icons using any graphics editor and export them at the required sizes.

## Temporary Workaround

If you want to test the extension without creating icons immediately, you can use a simple online tool to generate placeholder icons or temporarily comment out the "icons" sections in the manifest.json file.
