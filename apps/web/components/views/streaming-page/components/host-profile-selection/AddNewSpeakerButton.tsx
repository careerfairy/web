import { Box, Fab, Typography } from "@mui/material"
import { Plus } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      gap: "12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      "&:hover, &:focus": {
         transform: "scale(1.05)",
      },
   },
   addButton: {
      width: 80,
      height: 80,
      boxShadow: "none",
      filter: "none",
      border: `1px solid #EDE7FD`,
      bgcolor: "#F7F8FC",
      "& svg": {
         width: 40,
         height: 40,
         color: "neutral.400",
      },
   },
   text: {
      color: "neutral.700",
      textWrap: "nowrap",
   },
})

export const AddNewSpeakerButton = () => {
   return (
      <Box sx={styles.root}>
         <Fab sx={styles.addButton}>
            <Plus />
         </Fab>
         <Typography sx={styles.text} variant="medium">
            Add speaker
         </Typography>
      </Box>
   )
}
