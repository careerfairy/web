import { ButtonProps } from "@mui/material"
import React, { FC } from "react"
import Button from "@mui/material/Button"
import Link from "../../common/Link"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   button: {
      textTransform: "none",
      py: 0.9,
   },
})

type WatchRecordingButtonProps = ButtonProps & {
   target?: string
}
const ContentButton: FC<WatchRecordingButtonProps> = ({
   onClick,
   color = "primary",
   href,
   children,
   ...props
}) => {
   return (
      <Button
         onClick={onClick}
         sx={styles.button}
         variant={"contained"}
         color={color}
         disableRipple
         size={"large"}
         // @ts-ignore
         component={href ? Link : "button"}
         href={href}
         {...props}
      >
         {children}
      </Button>
   )
}

export default ContentButton
