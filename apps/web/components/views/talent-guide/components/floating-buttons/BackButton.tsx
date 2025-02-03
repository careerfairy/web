import { Box, BoxProps } from "@mui/material"
import Link from "next/link"
import { forwardRef } from "react"
import { X as BackIcon } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: (theme) => theme.palette.text.primary,
      display: "flex",
   },
})

type Props = {
   size?: number
} & BoxProps<"a">

export const BackButton = forwardRef<HTMLAnchorElement, Props>(
   ({ size = 20, sx, ...props }, ref) => {
      return (
         <Box
            ref={ref}
            component={Link}
            href="/levels"
            {...props}
            sx={combineStyles(styles.root, sx)}
         >
            <BackIcon size={size} />
         </Box>
      )
   }
)

BackButton.displayName = "BackButton"
