import { TapeStrip } from './Doodles'

// Renders a tilted polaroid-style photo with tape and caption
export default function Polaroid({
  src,
  alt,
  caption,
  rotate = '-3deg',
  objectPosition = 'center',
  className = '',
}) {
  return (
    <figure
      className={`relative w-fit rounded-sm bg-white p-3 pb-5 shadow-lift ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      <TapeStrip className="absolute -top-4 left-1/2 -translate-x-1/2" />
      <img
        src={src}
        alt={alt}
        width="360"
        height="360"
        loading="lazy"
        className="aspect-square w-full rounded-[2px] object-cover"
        style={{ objectPosition }}
      />
      {caption && (
        <figcaption className="mt-2 text-center font-script text-xl text-plum-700">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
