/**
 * Preloaded 16-Bit Pixel Art Assets Cache
 */

class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();

  constructor() {
    this.loadImage('submarine', '/assets/submarine.png');
    this.loadImage('shipwreck', '/assets/shipwreck.png');
    this.loadImage('leviathan', '/assets/leviathan.png');
  }

  private loadImage(key: string, src: string) {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = src;
    this.images.set(key, img);
  }

  public getImage(key: string): HTMLImageElement | undefined {
    const img = this.images.get(key);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return undefined;
  }
}

export const assetManager = new AssetManager();
