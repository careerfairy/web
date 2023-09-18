import {
   Box,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Drawer,
   Grow,
   IconButton,
   Typography,
} from "@mui/material"
import React, { useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import CloseIcon from "@mui/icons-material/CloseRounded"
import {
   SparkCategory,
   getCategoryEmoji,
   sparksCategoriesArray,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Button } from "@mui/material"
import { useFormik } from "formik"
import SparkIcon from "components/views/common/icons/SparkIcon"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useDispatch } from "react-redux"
import {
   fetchNextSparks,
   resetSparksFeed,
   setSparkCategories,
} from "store/reducers/sparksFeedReducer"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { DRAWER_WIDTH } from "constants/layout"

const styles = sxStyles({
   drawerPaper: {
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
   },
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: "16px",
      pb: "0px",
   },
   mobileTitle: {
      fontWeight: 700,
      fontSize: "20px",
   },
   desktopTitle: {
      display: "flex",
      alignItems: "center",
      fontSize: "16px",
   },
   filterIcon: {
      display: "flex",
      alignItems: "center",
      mr: "9px",
      "& .MuiSvgIcon-root": {
         fontSize: "20px",
      },
   },
   dialogContent: {
      px: "16px",
      pt: "16px",
      pb: 0,
      border: "none",
   },
   dialogActions: {
      pt: 0,
      px: "16px",
      display: "flex",
      flexDirection: "column",
   },
   actionButton: {
      width: "100%",
      textTransform: "none",
   },
   saveButton: {
      fontWeight: 600,
   },
   cancelButton: {
      color: "grey!important",
      mt: "10px",
      "&:hover": {
         backgroundColor: "grey.main",
         color: "black!important",
      },
   },
   chipsContainer: {
      my: "32px",
   },
   chip: {
      mb: "12px",
      mr: "12px",
   },
   topicText: {
      fontSize: "18px",
      fontWeight: 500,
   },
   selectText: {
      fontSize: "16px",
      color: "tertiary.dark",
   },
   closeIcon: {
      "& svg": {
         width: { xs: "32px", md: "24px" },
         height: { xs: "32px", md: "24px" },
         color: "black.main",
      },
   },
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   selectedCategoryIds: SparkCategory["id"][]
}

const SparksFilterDialog = ({
   isOpen,
   handleClose,
   selectedCategoryIds,
}: Props) => {
   const isMobile = useIsMobile()

   const isFullScreen = useSparksFeedIsFullScreen()

   return (
      <>
         {isMobile ? (
            <Drawer
               PaperProps={{
                  sx: styles.drawerPaper,
               }}
               anchor={"bottom"}
               open={isOpen}
               onClose={handleClose}
               ModalProps={{ sx: { zIndex: 3000 } }}
            >
               <FilterContent
                  handleClose={handleClose}
                  selectedCategoryIds={selectedCategoryIds}
                  isMobile={isMobile}
               />
            </Drawer>
         ) : (
            <Dialog
               maxWidth="sm"
               scroll="paper"
               fullWidth
               TransitionComponent={Grow}
               open={isOpen}
               onClose={handleClose}
               PaperProps={{
                  style: { left: isFullScreen ? "0%" : DRAWER_WIDTH - 120 },
               }}
            >
               <FilterContent
                  handleClose={handleClose}
                  selectedCategoryIds={selectedCategoryIds}
                  isMobile={isMobile}
               />
            </Dialog>
         )}
      </>
   )
}

type ContentProps = {
   handleClose: () => void
   isMobile: boolean
   selectedCategoryIds: SparkCategory["id"][]
}

const FilterContent = ({
   handleClose,
   isMobile,
   selectedCategoryIds,
}: ContentProps) => {
   const dispatch = useDispatch()
   const formik = useFormik({
      initialValues: selectedCategoryIds,
      onSubmit: (values) => {
         dispatch(resetSparksFeed())
         dispatch(setSparkCategories(values ? values : []))
         dispatch(fetchNextSparks())
      },
   })

   const handleChipClick = useCallback(
      (chipCategoryId: SparkCategory["id"]) => {
         if (formik.values.includes(chipCategoryId)) {
            formik.setValues(
               formik.values.filter((topic) => topic != chipCategoryId)
            )
         } else {
            return formik.setValues([...formik.values, chipCategoryId])
         }
      },
      [formik]
   )

   const handleCancelButton = useCallback(() => {
      formik.setValues(selectedCategoryIds)
      handleClose()
   }, [formik, handleClose, selectedCategoryIds])

   const handleSaveButton = useCallback(() => {
      formik.handleSubmit()
      handleClose()
   }, [formik, handleClose])

   const getChipColor = useCallback(
      (categoryId: SparkCategory["id"]) =>
         formik.values.includes(categoryId) ? "primary" : "default",
      [formik.values]
   )

   const getSxChipBorder = useCallback(
      (categoryId: SparkCategory["id"]) =>
         formik.values.includes(categoryId)
            ? { border: "none" }
            : { border: "1px solid lightgrey" },
      [formik.values]
   )

   const dialogTitle = useMemo(
      () => (
         <DialogTitle
            sx={[
               styles.titleContainer,
               isMobile ? { borderBottom: "1px solid #F7F7F7", py: "3px" } : {},
            ]}
         >
            <Typography
               sx={isMobile ? styles.mobileTitle : styles.desktopTitle}
            >
               {isMobile ? null : (
                  <Box sx={styles.filterIcon}>
                     <SparkIcon />
                  </Box>
               )}
               Filter content
            </Typography>
            <Box sx={styles.closeIcon}>
               <IconButton onClick={handleClose}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
      ),
      [handleClose, isMobile]
   )

   return (
      <>
         {dialogTitle}
         <DialogContent dividers sx={styles.dialogContent}>
            <Typography sx={styles.topicText}>
               Which topics are you interested in?
            </Typography>
            <Typography sx={styles.selectText}>
               Filter Sparks based on the following categories.
            </Typography>
            <Box sx={styles.chipsContainer}>
               {sortedSparksCategories.map((category) => (
                  <Chip
                     variant={"filled"}
                     key={category.id}
                     sx={[styles.chip, getSxChipBorder(category.id)]}
                     label={getCategoryEmoji(category.id) + " " + category.name}
                     onClick={() => handleChipClick(category.id)}
                     color={getChipColor(category.id)}
                  />
               ))}
            </Box>
         </DialogContent>
         <DialogActions sx={styles.dialogActions}>
            <Button
               sx={[styles.actionButton, styles.saveButton]}
               variant={"contained"}
               onClick={handleSaveButton}
            >
               Save
            </Button>
            <Button
               sx={[
                  styles.actionButton,
                  styles.cancelButton,
                  isMobile ? { mt: "6px" } : { py: 0 },
               ]}
               onClick={handleCancelButton}
            >
               Cancel
            </Button>
         </DialogActions>
      </>
   )
}

const sortedSparksCategories = sparksCategoriesArray.sort((cat1, cat2) =>
   cat1.id < cat2.id ? 1 : -1
)

export default SparksFilterDialog
