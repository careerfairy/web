import { Avatar, AvatarProps } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import Image from "next/image"
import { FC, useMemo } from "react"

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
               src={getResizedUrl(creator.avatarUrl, "md")}
               alt={displayName}
               layout="fill"
               objectFit="cover"
            />
         ) : (
            `${creator.firstName[0]} ${creator.lastName[0]}`
         )}
      </Avatar>
   )
}

export default CreatorAvatar
