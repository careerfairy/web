import { Box, Button, CircularProgress, Typography } from "@mui/material"
import { useCompanyPage } from "../index"

import { sxStyles } from "../../../../types/commonTypes"
// react feather
import SanitizedHTML from "components/util/SanitizedHTML"
import dynamic from "next/dynamic"
import { Edit2 as EditIcon } from "react-feather"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import EditDialog from "../EditDialog"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      position: "relative",
   },
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   iconsWrapper: {
      display: "flex",
      flexDirection: "column",
      mt: 2,
   },
   tag: {
      display: "flex",
      my: 1,
   },
})

const AboutDialog = dynamic(() => import("./AboutDialog"), {
   ssr: false,
   loading: () => <CircularProgress />,
})

const AboutSection = () => {
   const { group, editMode } = useCompanyPage()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const { extraInfo } = group

   return (
      <>
         <Box sx={styles.wrapper}>
            <Box sx={styles.titleSection}>
               <Typography variant="brandedH3" fontWeight={"600"} color="black">
                  About
               </Typography>
               {editMode ? (
                  <Button
                     data-testid={"about-section-edit-button"}
                     startIcon={<EditIcon size={18} />}
                     variant="text"
                     color="primary"
                     onClick={handleOpenDialog}
                  >
                     Edit
                  </Button>
               ) : null}
            </Box>
            <Box mt={2}>
               <Typography variant="h6" fontWeight={"400"} color="black">
                  <SanitizedHTML htmlString={extraInfo} />
               </Typography>
            </Box>
         </Box>

         {isDialogOpen ? (
            <EditDialog
               open={isDialogOpen}
               title={"About"}
               handleClose={handleCloseDialog}
            >
               <AboutDialog handleClose={handleCloseDialog} />
            </EditDialog>
         ) : null}
      </>
   )
}

export default AboutSection
