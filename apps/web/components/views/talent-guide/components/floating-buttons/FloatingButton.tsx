import { Box, Button, ButtonProps } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Fragment } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   button: {
      position: "fixed",
      bottom: {
         xs: 30,
         md: 40,
      },
      left: "50%",
      transform: "translateX(-50%)",
      px: 2,
      display: "flex",
      justifyContent: "center",
      width: 343,
      zIndex: (theme) => theme.zIndex.drawer + 2,
   },
   buttonOffset: {
      height: {
         xs: 78,
         md: 88,
      },
   },
})

export const FloatingButton = ({ children, sx, ...props }: ButtonProps) => {
   const isMobile = useIsMobile()
   return (
      <Fragment>
         <Box sx={styles.buttonOffset} />
         <Button
            size="large"
            fullWidth={isMobile}
            sx={combineStyles(styles.button, sx)}
            {...props}
         >
            {children}
         </Button>
      </Fragment>
   )
}
