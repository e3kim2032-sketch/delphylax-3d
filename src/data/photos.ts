/**
 * Captions for the "Build photos" gallery on the Robot page.
 *
 * HOW TO ADD A PHOTO
 * 1. Put the image file in public/photos/ (JPG, PNG, WebP or AVIF).
 *    iPhone HEIC files do not show in most browsers: export them as JPG first.
 * 2. Add a line below with the exact file name, a caption, and (optionally) alt text
 *    that describes the picture for people who cannot see it.
 * 3. Commit and push. The gallery appears by itself as soon as the folder has a photo,
 *    and stays hidden while it is empty. Photos are shown in file-name order.
 *
 * A photo with no line here still shows; it just uses its file name as the caption.
 *
 * PRIVACY: build photos only. No faces, no name tags, no school uniforms or logos,
 * and remove location data from the file before adding it.
 */
export const PHOTO_CAPTIONS: Record<string, { caption?: string; alt?: string }> = {
  // 'hull-saddles.jpg': { caption: 'Saddles strapped to the PVC pipes', alt: 'Two white pipes joined by grey 3D-printed saddles' },
}
