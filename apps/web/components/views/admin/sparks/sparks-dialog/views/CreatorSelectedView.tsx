import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import { Chip } from "@mui/material"

const styles = sxStyles({
   root: {
      m: {
         xs: 0,
         mobile: "auto",
      },
      width: "100%",
   },
   cretaorDetailsWrapper: {
      display: "flex",
      height: 474,
      backgroundColor: "background.paper",
      position: "relative",
   },
})

const CreatorSelectedView = () => {
   const { stepper, goToCreatorSelectedView } = useSparksForm()

   const handleClickEdit = () => {}

   return (
      <SparksDialog.Container
         onMobileBack={() => stepper.goToStep("select-creator")}
         sx={styles.root}
      >
         <SparksDialog.Title pl={2}>
            <Box component="span" color="secondary.main">
               Creator
            </Box>{" "}
            selected!
         </SparksDialog.Title>
         <SparksDialog.Subtitle>
            Please check if that’s the correct creator
         </SparksDialog.Subtitle>
         <Box sx={styles.cretaorDetailsWrapper}>
            <Chip
               label="Custom delete icon"
               onClick={handleClick}
               onDelete={handleDelete}
               deleteIcon={<DoneIcon />}
            />
         </Box>
      </SparksDialog.Container>
   )
}

export default CreatorSelectedView
