import PropTypes from "prop-types"
import { Button, DialogActions, DialogContent } from "@mui/material"
import React, { memo, useContext, useMemo } from "react"
import * as yup from "yup"
import { URL_REGEX } from "components/util/constants"
import { useFormik } from "formik"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import useStreamRef from "components/custom-hook/useStreamRef"
import TutorialContext from "context/tutorials/TutorialContext"
import { StyledTooltipWithButton } from "materialUI/GlobalTooltips"

import { jobDescription } from "./exampleFormData"
import useSliderFullyOpened from "components/custom-hook/useSliderFullyOpened"
import JobPostingCtaForm from "./CallToActionForms/JobPostingCtaForm"
import SocialCtaForm from "./CallToActionForms/SocialCtaForm"
import CustomMessageCtaForm from "./CallToActionForms/CustomMessageCtaForm"

const MAX_BUTTON_TEXT_LENGTH = 45
const MAX_MESSAGE_LENGTH = 1000
const MAX_JOB_TITLE_LENGTH = 1000
const MAX_SALARY_LENGTH = 200

const getMaxLengthError = (maxLength) => [
   maxLength,
   `This value is too long. It should have ${maxLength} characters or fewer.`,
]

const now = new Date()
const validationSchema = (type) =>
   yup.object({
      message: yup
         .string("Enter your message")
         .max(...getMaxLengthError(MAX_MESSAGE_LENGTH)),
      buttonText: yup
         .string("Enter the button text")
         .max(...getMaxLengthError(MAX_BUTTON_TEXT_LENGTH))
         .required("This value is required"),
      buttonUrl: yup
         .string("Enter the call to action url")
         .matches(URL_REGEX, { message: "Must be a valid url" })
         .required("Must be a valid url"),
      imageUrl: yup
         .string("Enter the image url")
         .matches(URL_REGEX, { message: "Must be a valid url" }),
      jobData: yup.object().shape({
         jobTitle:
            type === "jobPosting"
               ? yup
                    .string()
                    .max(...getMaxLengthError(MAX_JOB_TITLE_LENGTH))
                    .required("This value is required")
               : yup.string(),
         salary: yup.string().max(...getMaxLengthError(MAX_SALARY_LENGTH)),
         applicationDeadline: yup
            .date()
            .nullable()
            .min(now, `The date must be in the future`),
      }),
   })

const CallToActionForm = memo(
   ({
      handleClose,
      isTestStream,
      initialValues,
      isCustom,
      isJobPosting,
      isSocial,
   }) => {
      const [fullyOpened, onEntered, onExited] = useSliderFullyOpened()

      const { handleConfirmStep, isOpen } = useContext(TutorialContext)
      const isActiveTutorialStep = isOpen(20, isTestStream)

      const streamRef = useStreamRef()
      const dispatch = useDispatch()
      const {
         createCallToAction,
         updateCallToAction,
         activateCallToAction,
         clickOnCallToAction,
         dismissCallToAction,
      } = useFirebaseService()

      const canChangeMessage = useMemo(
         () => Boolean(isCustom || isJobPosting),
         [isCustom, isJobPosting]
      )

      const getInitialValues = (
         isJobPosting,
         isActiveTutorialStep,
         initialValues
      ) => {
         if (isJobPosting && isActiveTutorialStep) {
            return {
               ...initialValues,
               jobData: {
                  salary: "CHF - 82'000",
                  jobTitle: "Mechanical Engineer",
               },
               buttonUrl: "https://www.linkedin.com/jobs/",
               message: jobDescription,
            }
         }
         return { ...initialValues, isForTutorial: false }
      }

      const buildFormikForm = (type, validationSchema) => {
         // eslint-disable-next-line react-hooks/rules-of-hooks
         return useFormik({
            initialValues: getInitialValues(
               isJobPosting,
               isActiveTutorialStep,
               initialValues
            ),
            enableReinitialize: true,
            validationSchema: validationSchema,
            onSubmit: async (values, { setSubmitting }) => {
               try {
                  setSubmitting(true)
                  if (values.isToBeSaved) {
                     await handleSave(values)
                  } else {
                     await handleSend(values)
                  }

                  if (isActiveTutorialStep) {
                     handleConfirmStep(20)
                  }
               } catch (e) {
                  dispatch(actions.sendGeneralError(e))
                  console.error("-> Error: failed in submitting CTA", e)
               }
               setSubmitting(false)
               handleClose()
            },
         })
      }

      const formik = useFormik({
         initialValues: getInitialValues(
            isJobPosting,
            isActiveTutorialStep,
            initialValues
         ),
         enableReinitialize: true,
         validationSchema: validationSchema(initialValues.type),
         onSubmit: async (values, { setSubmitting }) => {
            try {
               setSubmitting(true)
               if (values.isToBeSaved) {
                  await handleSave(values)
               } else {
                  await handleSend(values)
               }
               if (isActiveTutorialStep) {
                  handleConfirmStep(20)
               }
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
               console.error("-> Error: failed in submitting CTA", e)
            }
            setSubmitting(false)
            handleClose()
         },
      })

      const handleSubmitTutorialJobPosting = async () => {
         try {
            await formik.handleSubmit()
         } catch (e) {
            console.error("-> Error: failed in submitting tutorial CTA", e)
         }
      }

      const handleSend = async (formData) => {
         let values = { ...formData }
         if (values.id) {
            await updateCallToAction(streamRef, values.id, values)
            return await activateCallToAction(streamRef, values.id)
         }
         const callToActionId = await createCallToAction(streamRef, {
            ...values,
            isForTutorial: Boolean(isActiveTutorialStep),
         })
         if (isActiveTutorialStep) {
            const closeSnack = () =>
               dispatch(actions.closeSnackbar(callToActionId))
            const handleDismissCallToAction = async () => {
               await dismissCallToAction(streamRef, callToActionId)
               closeSnack()
            }

            const handleClickCallToAction = async () => {
               await clickOnCallToAction(streamRef, callToActionId)
               closeSnack()
               if (window) {
                  window.open(values.buttonUrl, "_blank")
               }
            }

            dispatch(
               actions.enqueueJobPostingCta(
                  {
                     ...values,
                     id: callToActionId,
                     isForTutorial: true,
                  },
                  handleClickCallToAction,
                  handleDismissCallToAction
               )
            )
         }
         return await activateCallToAction(streamRef, callToActionId)
      }

      const handleSave = async (values) => {
         if (values.id) {
            return await updateCallToAction(streamRef, values.id, values)
         }
         return await createCallToAction(streamRef, values)
      }

      return (
         <React.Fragment>
            <DialogContent>
               <StyledTooltipWithButton
                  open={isActiveTutorialStep && fullyOpened}
                  tooltipTitle="Share Job Posts (4/8)"
                  buttonDisabled={formik.isSubmitting}
                  placement="top"
                  buttonText="Send Job Posting!"
                  onConfirm={handleSubmitTutorialJobPosting}
                  tooltipText="Here, we have pre-filled an imaginary job posting for your audience. Go ahead and send this job posting so that your audience can engage with it."
               >
                  <span>
                     {isSocial && <SocialCtaForm formik={formik} />}
                     {isJobPosting && (
                        <JobPostingCtaForm
                           formik={formik}
                           maxMessageLength={MAX_MESSAGE_LENGTH}
                           onEntered={onEntered}
                           onExited={onExited}
                        />
                     )}
                     {isCustom && (
                        <CustomMessageCtaForm
                           formik={formik}
                           onEntered={onEntered}
                           onExited={onExited}
                           maxButtonTextLength={MAX_BUTTON_TEXT_LENGTH}
                           maxMessageLength={MAX_MESSAGE_LENGTH}
                        />
                     )}
                  </span>
               </StyledTooltipWithButton>
            </DialogContent>
            <DialogActions>
               <Button
                  disabled={formik.isSubmitting || isActiveTutorialStep}
                  onClick={async () => {
                     await formik.setFieldValue("isToBeSaved", true)
                     await formik.handleSubmit()
                  }}
                  variant="outlined"
                  color="secondary"
               >
                  {initialValues.id ? "Update" : "Save"}
               </Button>
               <Button
                  disabled={formik.isSubmitting}
                  onClick={async () => {
                     await formik.setFieldValue("isToBeSaved", false)
                     await formik.handleSubmit()
                  }}
                  variant="contained"
                  color="primary"
               >
                  Send now
               </Button>
            </DialogActions>
         </React.Fragment>
      )
   }
)

CallToActionForm.displayName = "CallToActionForm"

CallToActionForm.propTypes = {
   handleClose: PropTypes.func,
   initialValues: PropTypes.object.isRequired,
   isCustom: PropTypes.bool,
   isJobPosting: PropTypes.bool,
}

export default CallToActionForm
