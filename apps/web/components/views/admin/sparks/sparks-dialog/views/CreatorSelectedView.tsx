import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"

const styles = sxStyles({
   root: {
      m: {
         xs: 0,
         mobile: "auto",
      },
      width: "100%",
   },
})

const CreatorSelectedView = () => {
   const { stepper } = useSparksForm()

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
      </SparksDialog.Container>
   )
}

export default CreatorSelectedView
