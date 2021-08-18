export function safeImage() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    return img;
}