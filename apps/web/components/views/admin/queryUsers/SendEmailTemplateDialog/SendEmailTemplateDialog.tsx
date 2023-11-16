import React, { useEffect, useState } from "react"
import {
   Box,
   Button,
   Collapse,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   Step,
   StepLabel,
   Stepper,
   useMediaQuery,
} from "@mui/material"
import { GlassDialog } from "materialUI/GlobalModals"
import { useTheme } from "@mui/material/styles"
import { useFirestore } from "react-redux-firebase"
import {
   FORTY_FIVE_MINUTES_IN_MILLISECONDS,
   UPCOMING_LIVESTREAMS_NAME,
} from "../../../../../data/constants/streamContants"
import { useSelector } from "react-redux"
import EmailTemplateCard from "./EmailTemplateCard"
import EmailTemplateForm from "./EmailTemplateForm"
import useTemplates from "./templates"
import EventOptionPreview from "../../../common/EventAutoSelect/EventOptionPreview"
import EventAutoSelect from "../../../common/EventAutoSelect"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { RootState } from "../../../../../store"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/dist/bigQuery/types"

function getSteps() {
   return [
      "Select an event you wish to promote",
      "Select your template",
      "Finalize your template",
   ]
}

const EventSelectView = ({
   handleClose,
   handleNext,
   targetStream,
   setTargetStream,
}: TemplateDialogStepProps) => {
   const upcomingStreams = useSelector(
      (state: RootState) =>
         state.firestore.ordered[UPCOMING_LIVESTREAMS_NAME] || []
   )
   const [inputValue, setInputValue] = useState("")

   return (
      <>
         <Box p={2}>
            <Collapse in={Boolean(targetStream)} unmountOnExit>
               <Box mb={2}>
                  <EventOptionPreview preview streamData={targetStream} />
               </Box>
            </Collapse>
            <EventAutoSelect
               value={targetStream}
               onChange={(event, newValue) => {
                  setTargetStream(newValue)
               }}
               inputValue={inputValue}
               onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue)
               }}
               id="event-select-menu"
               options={upcomingStreams}
               fullWidth
            />
         </Box>
         <DialogActions>
            <Box marginRight="auto">
               <Button onClick={handleClose}>Close</Button>
            </Box>
            {targetStream && (
               <Button variant="contained" color="primary" onClick={handleNext}>
                  Continue
               </Button>
            )}
         </DialogActions>
      </>
   )
}

const TemplateSelectView = ({
   handleClose,
   handleBack,
   setTargetTemplate,
   targetTemplate,
   handleNext,
}: TemplateDialogStepProps) => {
   const templates = useTemplates()
   return (
      <>
         <DialogTitle>Choose a template</DialogTitle>
         <Box display="flex" justifyContent="center" p={1}>
            {templates.map((template) => (
               <EmailTemplateCard
                  key={template.templateId}
                  templateEditUrl={template.templateEditUrl}
                  selected={
                     template.templateImageUrl ===
                     targetTemplate?.templateImageUrl
                  }
                  onClick={() => setTargetTemplate(template)}
                  templateImageUrl={template.templateImageUrl}
                  templateName={template.templateName}
               />
            ))}
         </Box>
         <DialogActions>
            <Box marginRight="auto">
               <Button onClick={handleClose}>Close</Button>
            </Box>
            <Button onClick={handleBack}>Back</Button>{" "}
            {targetTemplate && (
               <Button onClick={handleNext} color="primary" variant="contained">
                  Next
               </Button>
            )}
         </DialogActions>
      </>
   )
}

const TemplateFinalizeView = (props: TemplateDialogStepProps) => {
   return <EmailTemplateForm {...props} />
}

export type TemplateDialogStepProps = {
   handleClose: () => void
   handleBack: () => void
   handleNext: () => void
   targetStream: LivestreamEvent
   setTargetStream: (stream: LivestreamEvent) => void
   setTargetTemplate: (template: any) => void
   targetTemplate: any
   totalUsers: number
   queryOptions: BigQueryUserQueryOptions
}
function getStepContent(stepIndex, props: TemplateDialogStepProps) {
   switch (stepIndex) {
      case 0:
         return <EventSelectView {...props} />
      case 1:
         return <TemplateSelectView {...props} />
      case 2:
         return <TemplateFinalizeView {...props} />
      default:
         return "Unknown stepIndex"
   }
}
const targetTime = new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS)

interface ContentProps {
   queryOptions: BigQueryUserQueryOptions
   totalUsers: number
   handleClose: () => void
}
const Content = ({ handleClose, totalUsers, queryOptions }: ContentProps) => {
   const firestore = useFirestore()
   const [activeStep, setActiveStep] = useState(0)
   const [targetStream, setTargetStream] = useState(null)
   const [targetTemplate, setTargetTemplate] = useState(null)
   const steps = getSteps()

   useEffect(() => {
      ;(async function () {
         await firestore.get({
            collection: "livestreams",
            where: [
               ["start", ">", targetTime],
               ["test", "==", false],
            ],
            orderBy: ["start", "asc"],
            storeAs: UPCOMING_LIVESTREAMS_NAME,
         })
      })()
   }, [])

   useEffect(() => {
      // if no event is selected please stay on the first step
      if (!targetStream) handleReset()
   }, [Boolean(targetStream)])

   const handleNext = () => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
   }

   const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1)
   }

   const handleReset = () => {
      setActiveStep(0)
   }
   return (
      <DialogContent>
         <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
               <Step key={label}>
                  <StepLabel>{label}</StepLabel>
               </Step>
            ))}
         </Stepper>
         {getStepContent(activeStep, {
            handleClose,
            handleBack,
            handleNext,
            targetStream,
            setTargetStream,
            setTargetTemplate,
            targetTemplate,
            totalUsers,
            queryOptions,
         })}
      </DialogContent>
   )
}
interface Props {
   queryOptions: BigQueryUserQueryOptions
   totalUsers: number
   open: boolean
   onClose: () => void
}
const SendEmailTemplateDialog = ({
   open,
   onClose,
   totalUsers,
   queryOptions,
}: Props) => {
   const handleClose = () => {
      onClose()
   }
   const { breakpoints } = useTheme()
   const mobile = useMediaQuery(breakpoints.down("sm"))
   return (
      <GlassDialog
         maxWidth="md"
         fullWidth
         fullScreen={mobile}
         scroll="body"
         TransitionComponent={Grow}
         open={open}
      >
         <Content
            queryOptions={queryOptions}
            totalUsers={totalUsers}
            handleClose={handleClose}
         />
      </GlassDialog>
   )
}

export default SendEmailTemplateDialog
