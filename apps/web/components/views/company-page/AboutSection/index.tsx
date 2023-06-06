import { useCallback, useMemo } from "react"
import { Box, Button, Typography } from "@mui/material"
import { SectionAnchor, TabValue, useCompanyPage } from "../index"

import { sxStyles } from "../../../../types/commonTypes"
// react feather
import {
   Edit2 as EditIcon,
   MapPin as MapPinIcon,
   Tag as TagIcon,
   Users as UsersIcon,
} from "react-feather"
import EditDialog from "../EditDialog"
import AboutDialog from "./AboutDialog"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"

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

const AboutSection = () => {
   const {
      group,
      editMode,
      sectionRefs: { aboutSectionRef },
   } = useCompanyPage()

   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()

   const { companyCountry, companyIndustries, companySize, extraInfo } = group

   const showIcons = useMemo(
      () => companySize || companyIndustries?.length || companyCountry?.name,
      [companyCountry?.name, companyIndustries?.length, companySize]
   )

   const renderIcons = useCallback(
      () => (
         <Box sx={styles.iconsWrapper}>
            {companyCountry?.name ? (
               <Box sx={styles.tag}>
                  <MapPinIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyCountry.name}
                  </Typography>
               </Box>
            ) : null}

            {companyIndustries?.length ? (
               <Box sx={styles.tag}>
                  <TagIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyIndustries.map(({ name }) => name).join(", ")}
                  </Typography>
               </Box>
            ) : null}

            {companySize ? (
               <Box sx={styles.tag}>
                  <UsersIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companySize}
                  </Typography>
               </Box>
            ) : null}
         </Box>
      ),
      [companyCountry?.name, companyIndustries, companySize]
   )

   return (
      <>
         <Box sx={styles.wrapper}>
            <SectionAnchor ref={aboutSectionRef} tabValue={TabValue.profile} />
            <Box sx={styles.titleSection}>
               <Typography variant="h4" fontWeight={"600"} color="black">
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
                     <Typography fontSize={"15px"} fontWeight={"600"}>
                        EDIT
                     </Typography>
                  </Button>
               ) : null}
            </Box>
            {showIcons ? renderIcons() : null}
            <Box mt={2}>
               <Typography variant="h6" fontWeight={"400"} color="black">
                  {extraInfo}
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
