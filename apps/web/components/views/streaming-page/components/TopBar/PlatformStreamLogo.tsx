import Image, { ImageProps } from "next/image"

const IMAGE_STYLE: ImageProps["style"] = {
   objectFit: "contain",
}

export const PlatformStreamLogo = () => {
   return (
      <Image
         style={IMAGE_STYLE}
         src={"/logo_teal.png"}
         width={150}
         height={32}
         alt={"cf-logo"}
         priority
      />
   )
}
