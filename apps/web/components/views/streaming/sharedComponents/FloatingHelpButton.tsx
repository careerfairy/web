import React from "react"
import { sxStyles } from "../../../../types/commonTypes"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import { useCrisp } from "../../../../context/crisp/CrispProvider"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"

const styles = sxStyles({
   root: {
      position: "absolute",
      bottom: 8,
      left: 8,
      opacity: 0.8,
      display: "flex",
      flexDirection: "column",
      padding: "8px 16px",
      borderRadius: 1.5,
      color: "white",
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
      },
   },
})
const FloatingHelpButton = () => {
   const { openAndShowChatBot } = useCrisp()

   return (
      <Button
         size={"small"}
         color={"grey"}
         onClick={openAndShowChatBot}
         sx={styles.root}
      >
         <HelpOutlineOutlinedIcon />
         Help
      </Button>
   )
}

export default FloatingHelpButton
