import {
   Box,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   IconButton,
   Typography,
   useMediaQuery,
} from "@mui/material"
import React, { FC, useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { X as CloseIcon } from "react-feather"
import { useTheme } from "@mui/styles"
import {
   SparkCategory,
   getCategoryEmoji,
   sparksCategoriesArray,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Button } from "@mui/material"
import { useFormik } from "formik"
import SparkIcon from "components/views/common/icons/SparkIcon"

const styles = sxStyles({
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
   },
   title: {
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
      border: "none",
   },
   dialogActions: {
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
      py: "0px",
   },
   chipsContainer: {
      mt: "32px",
      mb: "20px",
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
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   selectedCategories: SparkCategory[]
   setSelectedCategories: React.Dispatch<React.SetStateAction<SparkCategory[]>>
}

const SparksFilterDialog: FC<Props> = ({
   isOpen,
   handleClose,
   selectedCategories,
   setSelectedCategories,
}) => {
   const { breakpoints } = useTheme()
   const isSmallDisplay = useMediaQuery(breakpoints.down("md"))
   const formik = useFormik({
      initialValues: selectedCategories,
      onSubmit: (values) => {
         setSelectedCategories(values)
      },
   })

   const handleChipClick = useCallback(
      (chipTopic: SparkCategory) => {
         if (formik.values.map((topic) => topic.id).includes(chipTopic.id)) {
            formik.setValues(
               formik.values.filter((topic) => topic.id != chipTopic.id)
            )
         } else {
            return formik.setValues([...formik.values, chipTopic])
         }
      },
      [formik]
   )

   const handleCancelButton = useCallback(() => {
      formik.setValues(selectedCategories)
      handleClose()
   }, [formik, handleClose, selectedCategories])

   const handleSaveButton = useCallback(() => {
      formik.handleSubmit()
      handleClose()
   }, [formik, handleClose])

   const getChipColor = useCallback(
      (category: SparkCategory) =>
         formik.values.includes(category) ? "primary" : "default",
      [formik.values]
   )

   return (
      <Dialog
         maxWidth="sm"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={isOpen}
         onClose={handleClose}
         PaperProps={{
            style: {
               left: isSmallDisplay ? "0%" : "10%",
            },
         }}
      >
         <DialogTitle>
            <Box sx={styles.titleContainer}>
               <Typography sx={styles.title}>
                  <Box sx={styles.filterIcon}>
                     <SparkIcon />
                  </Box>
                  Filter content
               </Typography>
               <IconButton onClick={handleClose}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent dividers sx={styles.dialogContent}>
            <Typography sx={styles.topicText}>
               Which topics are you interested in?
            </Typography>
            <Typography sx={styles.selectText}>
               Select the ones that you would love to see more here
            </Typography>
            <Box sx={styles.chipsContainer}>
               {sparksCategoriesArray.map((category) => (
                  <Chip
                     variant={"filled"}
                     key={category.id}
                     sx={styles.chip}
                     label={getCategoryEmoji(category.id) + " " + category.name}
                     color={getChipColor(category)}
                     onClick={() => handleChipClick(category)}
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
               sx={[styles.actionButton, styles.cancelButton]}
               onClick={handleCancelButton}
            >
               Cancel
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default SparksFilterDialog
