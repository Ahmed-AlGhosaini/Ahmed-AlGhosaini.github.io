// Renders an image or a looping muted video depending on the file extension,
// so you can drop a .mp4 demo anywhere an image is expected.

export default function Media({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  if (/\.(mp4|webm)$/i.test(src)) {
    return <video src={src} aria-label={alt} className={className} autoPlay loop muted playsInline />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer
  return <img src={src} alt={alt} className={className} />;
}
