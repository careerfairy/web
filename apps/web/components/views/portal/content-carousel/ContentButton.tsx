import { ButtonProps } from "@mui/material"
import Button from "@mui/material/Button"
import Link from "next/link"
import { FC } from "react"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   button: {
      textTransform: "none",
      py: 0.9,
   },
})

type WatchRecordingButtonProps = ButtonProps & {
   target?: string
   href?: string
   shallow?: boolean
}

const ContentButton: FC<WatchRecordingButtonProps> = ({
   onClick,
   color = "primary",
   href,
   target,
   children,
   shallow,
   ...props
}) => {
   if (href) {
      return (
         <Link href={href} target={target} shallow={shallow}>
            <Button
               onClick={onClick}
               sx={styles.button}
               variant={"contained"}
               color={color}
               disableRipple
               size={"large"}
               {...props}
            >
               {children}
            </Button>
         </Link>
      )
   }

   return (
      <Button
         onClick={onClick}
         sx={styles.button}
         variant={"contained"}
         color={color}
         disableRipple
         size={"large"}
         {...props}
      >
         {children}
      </Button>
   )
}

export default ContentButton
