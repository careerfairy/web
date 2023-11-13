import { shouldForwardProp } from "@careerfairy/shared-ui"
import { IconButton, styled } from "@mui/material"
import React from "react"

type Props = {
   active?: boolean
   deviceOff?: boolean
}

export const ActionBarButtonStyled = styled(IconButton, {
   shouldForwardProp: shouldForwardProp<Props>(["active", "deviceOff"]),
})<Props>(({ theme, active, deviceOff }) => ({
   width: 38,
   height: 38,
   [theme.breakpoints.up("tablet")]: {
      width: 44,
      height: 44,
   },
   backgroundColor: active ? theme.brand.tq[50] : theme.brand.white[200],
   border: active
      ? `1px solid ${theme.brand.tq[100]}`
      : `1px solid ${theme.brand.black[100]}`,
   "& svg": {
      fontSize: 24,
      width: 24,
      height: 24,
      color: deviceOff ? theme.palette.error.main : theme.palette.primary.main,
      [theme.breakpoints.up("tablet")]: {
         fontSize: 28,
         width: 28,
         height: 28,
      },
   },
}))

export type ActionButtonProps = React.ComponentProps<
   typeof ActionBarButtonStyled
>
