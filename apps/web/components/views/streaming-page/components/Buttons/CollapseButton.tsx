import { ButtonBase, ButtonBaseProps, Stack, Typography } from "@mui/material"
import { ChevronDown, ChevronUp } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   expandButton: {
      borderRadius: "6px",
      width: "100%",
      p: 0,
      fontFamily: "inherit",
      "& svg": {
         width: 24,
         height: 24,
      },
   },
})

type CollapseButtonProps = {
   open: boolean
   openText: string
   closeText: string
} & ButtonBaseProps

export const CollapseButton = ({
   sx,
   open,
   color = "neutral.700",
   closeText,
   openText,
   ...rest
}: CollapseButtonProps) => {
   return (
      <Stack
         justifyContent="space-between"
         alignItems="center"
         direction="row"
         sx={combineStyles(styles.expandButton, sx)}
         component={ButtonBase}
         color={color}
         {...rest}
      >
         <Typography variant="small">{open ? openText : closeText}</Typography>
         {open ? <ChevronUp /> : <ChevronDown />}
      </Stack>
   )
}
