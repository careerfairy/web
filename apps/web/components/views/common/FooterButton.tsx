import { Button, Grow } from "@mui/material"
import { IColors, sxStyles } from "../../../types/commonTypes"
import React, { useCallback, useEffect, useState } from "react"

const styles = sxStyles({
   button: {
      position: "fixed",
      bottom: "30px",
      left: 0,
      right: 0,
      marginX: "25%",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
   },
})

type Props = {
   handleClick: () => void
   buttonMessage: string
   size?: "small" | "medium" | "large"
   color?: Exclude<IColors, "inherit" | "action" | "disabled">
   variant?: "text" | "outlined" | "contained"
}

const FooterButton = ({
   handleClick,
   buttonMessage,
   size = "large",
   color = "primary",
   variant = "contained",
}: Props) => {
   const [showButton, setShowButton] = useState(false)

   useEffect(() => {
      window.addEventListener("scroll", checkShowButton)
      return () => window.removeEventListener("scroll", checkShowButton)
   }, [showButton])

   const checkShowButton = useCallback(() => {
      const footerElement = document.getElementById("page-footer")

      if (showButton && window.scrollY >= footerElement.offsetTop - 800) {
         setShowButton(false)
      } else if (
         !showButton &&
         window.scrollY > 600 &&
         window.scrollY < footerElement.offsetTop - 800
      ) {
         setShowButton(true)
      } else if (showButton && window.scrollY <= 600) {
         setShowButton(false)
      }
   }, [showButton])

   return (
      <Grow in={showButton}>
         <Button
            sx={styles.button}
            variant={variant}
            size={size}
            color={color}
            onClick={handleClick}
         >
            {buttonMessage}
         </Button>
      </Grow>
   )
}

export default FooterButton
