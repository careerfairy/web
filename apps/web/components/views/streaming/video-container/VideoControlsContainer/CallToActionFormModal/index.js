import PropTypes from "prop-types"
import React, { memo, useCallback, useEffect, useState } from "react"
import { Box, Dialog, DialogTitle, IconButton, Typography } from "@mui/material"
import CallToActionForm from "./CallToActionForm"
import CloseIcon from "@mui/icons-material/Close"
import CallToActionTypeMenu from "./CallToActionTypeMenu"
import { callToActionsDictionary } from "../../../../../util/constants/callToActions"

const { social } = callToActionsDictionary

const defaultInitialValues = {
   message: social.message,
   value: social.value,
   buttonText: social.buttonText,
   title: social.title,
   buttonUrl: "",
   isToBeSaved: false,
   type: social.type,
   id: "",
   imageUrl: "",
   jobData: {
      jobTitle: "",
      salary: "",
      applicationDeadline: null,
      isAtsPosition: false,
      atsUuid: "",
   },
   socialData: {
      socialType: social.socialTypes.linkedIn.socialType,
   },
}

const CallToActionFormModal = memo(
   ({ onClose, open, callToActionToEdit, isTestStream }) => {
      const [initialValues, setInitialValues] = useState(defaultInitialValues)

      const buildSocialCtaInitialValues = (cta) => {
         return {
            socialData: {
               socialType:
                  cta.socialData?.socialType ||
                  defaultInitialValues.socialData.socialType,
            },
         }
      }

      const buildJobPostingCtaInitialValues = (cta) => {
         return {
            imageUrl: cta.imageUrl || "",
            jobData: {
               jobTitle: cta.jobData?.jobTitle || "",
               salary: cta.jobData?.salary || "",
               applicationDeadline:
                  cta.jobData?.applicationDeadline?.toDate?.() || null,
               isAtsPosition: cta.jobData?.isAtsPosition || false,
               atsUuid: cta.jobData?.atsUuid || "",
            },
         }
      }

      const buildCustomCtaInitialValues = (cta) => {
         return {
            buttonText: cta.buttonText,
         }
      }

      useEffect(() => {
         if (callToActionToEdit) {
            let cta = callToActionToEdit
            const newInitialValues = {
               type: cta.type,
               id: cta.id,
               message: cta.message,
               color:
                  callToActionsDictionary[cta.type]?.color ||
                  defaultInitialValues.color,
               value:
                  callToActionsDictionary[cta.type]?.value ||
                  defaultInitialValues.value,
               buttonUrl: cta.buttonUrl || "",
               isToBeSaved: true,
               title:
                  callToActionsDictionary[cta.type]?.title ||
                  defaultInitialValues.title,
               ...buildSocialCtaInitialValues(cta),
               ...buildJobPostingCtaInitialValues(cta),
               ...buildCustomCtaInitialValues(cta),
            }
            setInitialValues(newInitialValues)
         } else {
            setInitialValues({ ...defaultInitialValues })
         }
      }, [callToActionToEdit])

      const handleClose = useCallback(() => {
         onClose()
      }, [onClose])

      const handleSetCallToActionType = ({
         newType,
         newMessage,
         newButtonText,
         newValue,
         newColor,
         newTitle,
      }) => {
         setInitialValues({
            ...defaultInitialValues,
            type: newType,
            message: newMessage,
            buttonText: newButtonText,
            value: newValue,
            color: newColor,
            title: newTitle,
         })
      }

      return (
         <Dialog maxWidth="md" fullWidth onClose={handleClose} open={open}>
            <DialogTitle>
               <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>
                     <Typography variant="h4">
                        {initialValues.id
                           ? "Update call to action"
                           : "Create a call to action and promote your"}
                     </Typography>
                  </Box>
                  <Box>
                     <IconButton onClick={handleClose} size="large">
                        <CloseIcon />
                     </IconButton>
                  </Box>
               </Box>
               <CallToActionTypeMenu
                  initialValues={initialValues}
                  handleSetCallToActionType={handleSetCallToActionType}
               />
            </DialogTitle>
            <CallToActionForm
               initialValues={initialValues}
               isTestStream={isTestStream}
               isSocial={initialValues.type === "social"}
               handleClose={handleClose}
               isCustom={initialValues.type === "custom"}
               isJobPosting={initialValues.type === "jobPosting"}
            />
         </Dialog>
      )
   }
)

CallToActionFormModal.displayName = "CallToActionFormModal"

CallToActionFormModal.propTypes = {
   callToActionToEdit: PropTypes.shape({
      buttonText: PropTypes.string,
      buttonUrl: PropTypes.string,
      id: PropTypes.string,
      message: PropTypes.string,
      type: PropTypes.string,
   }),
   onClose: PropTypes.func.isRequired,
   open: PropTypes.bool.isRequired,
}

export default CallToActionFormModal
