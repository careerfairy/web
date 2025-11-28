import { Box, ButtonBase, Typography } from "@mui/material"
import { ShieldUserIcon } from "components/views/common/icons/ShieldUserIcon"
import { sxStyles } from "types/commonTypes"
import { useHostProfileSelection } from "./HostProfileSelectionProvider"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      transition: (theme) => theme.transitions.create("transform"),
      "&:hover, &:focus": {
         transform: "scale(1.05)",
      },
   },
   button: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      border: "1px solid #EDE7FD",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: (theme) => theme.palette.secondary[50],
      "& svg": {
         display: "block",
         color: (theme) => theme.palette.secondary.main,
         width: 40,
         height: 40,
      },
   },
   name: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
   },
})

export const AssistantButton = () => {
   const { goToAssistantInfo } = useHostProfileSelection()

   return (
      <ButtonBase disableRipple onClick={goToAssistantInfo}>
         <Box sx={styles.root}>
            <Box sx={styles.button}>
               <ShieldUserIcon />
            </Box>
            <Typography sx={styles.name} variant="medium" color="neutral.700">
               Assistant
            </Typography>
         </Box>
      </ButtonBase>
   )
}
