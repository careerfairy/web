import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Tooltip,
} from "@mui/material"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import MultiStepWrapper from "../common/MultiStepWrapper"
import { FieldOfStudyUpdater } from "../signup/userInformation/FieldOfStudySelector"
import { LevelOfStudyUpdater } from "../signup/userInformation/LevelOfStudySelector"
import { BusinessFunctionsTagSelector } from "../signup/userInformation/tags/BusinessFunctionsTagSelector"
import { ContentTopicsTagSelector } from "../signup/userInformation/tags/ContentTopicsTagSelector"

export const missingDataFields = [
   {
      description: "Business Functions",
      isMissing: (userData) => {
         return !userData.businessFunctionsTagIds?.length
      },
      component: () => BusinessFunctionsTagSelector,
   },
   {
      description: "Content Topics",
      isMissing: (userData) => {
         return !userData.contentTopicsTagIds?.length
      },
      component: () => ContentTopicsTagSelector,
   },
   {
      description: "Field of study",
      isMissing: (userData) => {
         return !userData.fieldOfStudy?.name || !userData.fieldOfStudy?.id
      },
      component: () => FieldOfStudyUpdater,
   },
   {
      description: "Level of study",
      isMissing: (userData) => {
         return !userData.levelOfStudy?.name || !userData.levelOfStudy?.id
      },
      component: () => LevelOfStudyUpdater,
   },
]

const UserDataModal = ({ isModalOpen, handleModalClose, missingFields }) => {
   const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
   const { userData } = useAuth()
   const currentField = missingFields[currentFieldIndex]
   const isLastField = currentFieldIndex === missingFields.length - 1
   const isCurrentFieldComplete = !currentField.isMissing(userData)

   const handleNext = () => {
      if (isLastField) {
         handleModalClose(null, "end")
      } else {
         setCurrentFieldIndex((prev) => prev + 1)
      }
   }

   return (
      <Dialog
         onClose={handleModalClose}
         aria-labelledby="filldata-dialog-title"
         open={isModalOpen}
         disableEscapeKeyDown
      >
         <DialogTitle
            // @ts-ignore
            component="div"
            sx={{ m: 0, p: 2 }}
            id="filldata-dialog-title"
         >
            <Typography id="modal-modal-title" variant="h6" component="h2">
               You are missing important data on your profile
            </Typography>
            <Typography id="modal-modal-description" color="textSecondary">
               To improve your experience, fill in the missing data
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <Box mt={1}>
               <MultiStepWrapper
                  steps={missingFields}
                  currentStep={currentFieldIndex}
                  setCurrentStep={setCurrentFieldIndex}
               />
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Box>
               <Typography variant="body2" color="textSecondary">
                  Step {currentFieldIndex + 1} of {missingFields.length}
               </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
               <Tooltip
                  title={`Temporarily dismiss, you will be remembered again in the future to fill the data.`}
               >
                  <Button
                     onClick={handleModalClose}
                     disabled={isLastField ? isCurrentFieldComplete : null}
                  >
                     Dismiss
                  </Button>
               </Tooltip>
               <Button
                  onClick={handleNext}
                  disabled={!isCurrentFieldComplete}
                  variant="contained"
               >
                  {isCurrentFieldComplete
                     ? isLastField
                        ? "Save"
                        : "Next"
                     : "Next"}
               </Button>
            </Box>
         </DialogActions>
      </Dialog>
   )
}

export default UserDataModal
