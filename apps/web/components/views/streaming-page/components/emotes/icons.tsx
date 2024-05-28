import Image, { ImageProps } from "next/image"
import { forwardRef } from "react"

type EmoteProps = {
   size?: number
}

const DEFAULT_EMOTE_SIZE = 44

const Emote = forwardRef<
   HTMLImageElement,
   Pick<ImageProps, "src" | "alt"> & EmoteProps
>(function Emote({ src, alt, size = DEFAULT_EMOTE_SIZE }, ref) {
   return (
      <Image
         ref={ref}
         src={src}
         alt={alt}
         width={size}
         height={size}
         quality={100}
      />
   )
})

export const ConfusedEmote = forwardRef<HTMLImageElement, EmoteProps>(
   function ConfusedEmote(props, ref) {
      return (
         <Emote
            ref={ref}
            src="/emotes/confused.png"
            alt="confusion"
            {...props}
         />
      )
   }
)

export const LikeEmote = forwardRef<HTMLImageElement, EmoteProps>(
   function LikeEmote(props, ref) {
      return <Emote ref={ref} src="/emotes/like.png" alt="like" {...props} />
   }
)

export const HeartEmote = forwardRef<HTMLImageElement, EmoteProps>(
   function HeartEmote(props, ref) {
      return <Emote ref={ref} src="/emotes/heart.png" alt="heart" {...props} />
   }
)

export const ClapEmote = forwardRef<HTMLImageElement, EmoteProps>(
   function ClapEmote(props, ref) {
      return <Emote ref={ref} src="/emotes/clap.png" alt="clap" {...props} />
   }
)
