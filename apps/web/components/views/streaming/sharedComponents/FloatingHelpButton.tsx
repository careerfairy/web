import React from "react"
import { sxStyles } from "../../../../types/commonTypes"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import { alpha } from "@mui/material/styles"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { useSelector } from "react-redux"
import { leftMenuOpenSelector } from "../../../../store/selectors/streamSelectors"
import { Box, ButtonBase } from "@mui/material"

const styles = sxStyles({
   root: {
      opacity: 0.8,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
      boxShadow: 2,
      backdropFilter: "blur(5px)",
      padding: "8px 18.4px",
      borderRadius: 1.5,
      color: "white",
      "&:hover": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.5),
      },
      "&:disabled": {
         backgroundColor: (theme) => alpha(theme.palette.common.black, 0.2),
         color: (theme) => alpha(theme.palette.common.white, 0.5),
      },
   },
})

type Props = {
   openSupportInLeftMenu: () => void
}
const FloatingHelpButton = ({ openSupportInLeftMenu }: Props) => {
   const { selectedState } = useCurrentStream()
   const leftMenuOpen = useSelector(leftMenuOpenSelector)

   const disabled = selectedState === "support" && leftMenuOpen

   return (
      <Box
         component={ButtonBase}
         disabled={disabled}
         onClick={openSupportInLeftMenu}
         sx={styles.root}
      >
         <HelpOutlineOutlinedIcon />
         Help
      </Box>
   )
}

export default FloatingHelpButton
