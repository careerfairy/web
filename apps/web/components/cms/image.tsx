import Image, { ImageProps } from "next/image"
import { GraphCMSImageLoader } from "./util"
import React from "react"
import { CmsImage } from "../../types/cmsTypes"

interface Props {
   cmsImage: CmsImage
   imageProps?: Omit<ImageProps, "src">
}
const CmsImage = ({ imageProps, cmsImage }: Props) => {
   return (
      <Image
         src={cmsImage?.url}
         width={cmsImage?.width}
         height={cmsImage?.height}
         alt={cmsImage?.alt || cmsImage?.caption}
         {...imageProps}
         loader={GraphCMSImageLoader}
      />
   )
}
export default CmsImage
