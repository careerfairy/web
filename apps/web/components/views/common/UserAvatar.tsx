import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles"
import { useAuth } from "HOCs/AuthProvider"
import React from "react"
import ColorizedAvatar from "./ColorizedAvatar"
import { StylesProps } from "../../../types/commonTypes"
import Link from "./Link"
import { UserData } from "@careerfairy/shared-lib/users"

type stringSizes = "small" | "medium" | "large"
export interface UserAvatarProps {
   sx?: SxProps<DefaultTheme>
   size?: stringSizes | number | string
   data?: UserData
}
const small = 30
const medium = 50
const large = 80
const fontMultiplier = 0.5
const styles: StylesProps = {
   root: {
      textDecoration: "none",
   },
   small: {
      width: small,
      height: small,
      fontSize: small * fontMultiplier,
   },
   medium: {
      width: medium,
      height: medium,
      fontSize: medium * fontMultiplier,
   },
   large: {
      width: large,
      height: large,
      fontSize: large * fontMultiplier,
   },
}
const sizes: stringSizes[] = ["small", "medium", "large"]
const UserAvatar = ({ sx, size, data }: UserAvatarProps) => {
   const { userData } = useAuth()
   const isLoggedInUser = Boolean(
      data?.authId && data?.authId === userData?.authId
   )

   return (
      <ColorizedAvatar
         sx={[
            styles.root,
            size
               ? sizes.includes(size as stringSizes)
                  ? styles[size as stringSizes]
                  : {
                       width: size,
                       height: size,
                       fontSize: `calc(${
                          typeof size === "string" ? size : `${size}px`
                       } * ${fontMultiplier})`,
                    }
               : undefined,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         loading={Boolean(!data)}
         firstName={data?.firstName}
         lastName={data?.lastName}
         // @ts-ignore
         imageUrl={userData?.avatarUrl}
         onClick={(e) => e.stopPropagation()}
         // @ts-ignore
         component={isLoggedInUser ? Link : undefined}
         // @ts-ignore
         href={isLoggedInUser ? "/profile" : undefined}
      />
   )
}

export default UserAvatar
