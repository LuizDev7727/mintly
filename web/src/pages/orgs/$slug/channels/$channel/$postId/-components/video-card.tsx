type VideoCardProps = {
  src: string,
  poster?: string,
}

export function VideoCard({ src, poster }: VideoCardProps) {
  return (
    <video
      src={src}
      poster={poster}
      controls={true}
      autoPlay={true}
      muted={true}
      preload="metadata"
      className="size-full bg-black object-contain"
    />
  )
}
