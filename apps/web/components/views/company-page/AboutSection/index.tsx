import { useCallback, useMemo, useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import { useCompanyPage } from "../index"

import { sxStyles } from "../../../../types/commonTypes"
// react feather
import {
   MapPin as MapPinIcon,
   Tag as TagIcon,
   Users as UsersIcon,
   Edit2 as EditIcon,
} from "react-feather"
import EditDialog from "../EditDialog"
import AboutDialog from "./AboutDialog"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
   titleSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
   iconsWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      mt: 3,
   },
   icon: {
      display: "flex",
      ml: { md: 5 },
      mt: { xs: 1, md: "unset" },
   },
})

const AboutSection = () => {
   const { group, editMode } = useCompanyPage()
   const [openDialog, setOpenDialog] = useState(false)

   const { companyCountry, companyIndustry, companySize, extraInfo } = group

   const showIcons = useMemo(
      () => companySize || companyIndustry?.name || companyCountry?.name,
      [companyCountry?.name, companyIndustry?.name, companySize]
   )

   const renderIcons = useCallback(
      () => (
         <Box sx={styles.iconsWrapper}>
            {companyCountry?.name ? (
               <Box display={"flex"}>
                  <MapPinIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyCountry.name}
                  </Typography>
               </Box>
            ) : null}

            {companyIndustry?.name ? (
               <Box sx={styles.icon}>
                  <TagIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyIndustry.name}
                  </Typography>
               </Box>
            ) : null}

            {companySize ? (
               <Box sx={styles.icon}>
                  <UsersIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companySize}
                  </Typography>
               </Box>
            ) : null}
         </Box>
      ),
      [companyCountry?.name, companyIndustry?.name, companySize]
   )

   const handleCloseDialog = useCallback(() => {
      setOpenDialog(false)
   }, [])

   return (
      <>
         <Box sx={styles.wrapper}>
            <Box sx={styles.titleSection}>
               <Typography variant="h4" fontWeight={"600"} color="black">
                  About
               </Typography>
               {editMode ? (
                  <Button
                     startIcon={<EditIcon size={18} />}
                     variant="text"
                     color="primary"
                     onClick={() => {
                        setOpenDialog(true)
                     }}
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

         <EditDialog
            open={openDialog}
            title={"About"}
            handleClose={handleCloseDialog}
         >
            <AboutDialog handleClose={handleCloseDialog} />
         </EditDialog>
      </>
   )
}

export default AboutSection
