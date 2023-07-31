import { Avatar, AvatarProps } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import Image from "next/image"
import { FC, useMemo, useState } from "react"

type Props = {
   /**
    * Not hard casting this to the Creator type because we
    * also want to use it for displaying the public creator
    */
   creator: { firstName: string; lastName: string; avatarUrl?: string }
   size?: number | string
} & AvatarProps

const CreatorAvatar: FC<Props> = ({ creator, size, sx, ...props }) => {
   const displayName = `${creator.firstName} ${creator.lastName}`
   const [imgSrc, setImgSrc] = useState(getResizedUrl(creator.avatarUrl, "md"))

   const styles = useMemo<AvatarProps["sx"]>(
      () => [
         ...(Array.isArray(sx) ? sx : [sx]),
         size && {
            width: size,
            height: size,
         },
      ],
      [sx, size]
   )

   return (
      <Avatar alt={displayName} sx={styles} {...props}>
         {creator.avatarUrl ? (
            <Image
               src={imgSrc}
               alt={displayName}
               layout="fill"
               onError={() => {
                  // The resized image might not have been created yet, so we try the original image
                  setImgSrc(creator.avatarUrl)
               }}
               objectFit="cover"
            />
         ) : (
            `${creator.firstName[0]} ${creator.lastName[0]}`
         )}
      </Avatar>
   )
}

export default CreatorAvatar
