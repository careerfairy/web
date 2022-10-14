import React from "react"
import { sxStyles } from "../../../../types/commonTypes"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import Button from "@mui/material/Button"
import { alpha } from "@mui/material/styles"

const styles = sxStyles({
   root: {
      position: "absolute",
      bottom: 8,
      left: 8,
      opacity: 0.8,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      padding: "8px 16px",
      borderRadius: 1.5,
      color: "white",
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.1),
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
      },
   },
})

type Props = {
   openSupportInLeftMenu: () => void
}
const FloatingHelpButton = ({ openSupportInLeftMenu }: Props) => {
   return (
      <Button
         size={"small"}
         color={"grey"}
         onClick={openSupportInLeftMenu}
         sx={styles.root}
      >
         <HelpOutlineOutlinedIcon />
         Help
      </Button>
   )
}

export default FloatingHelpButton
