import { CUSTOM_JOB_CONSTANTS } from "@careerfairy/shared-lib/customJobs/constants"
import {
   JobType,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, CircularProgress } from "@mui/material"
import { Formik } from "formik"
import dynamic from "next/dynamic"
import { FC, useCallback, useRef } from "react"
import { useSelector } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import * as Yup from "yup"
import * as yup from "yup"
import JobFetchWrapper from "../../../../../../HOCs/job/JobFetchWrapper"
import { customJobRepo } from "../../../../../../data/RepositoryInstances"
import { Timestamp } from "../../../../../../data/firebase/FirebaseInstance"
import { jobsFormSelectedJobIdSelector } from "../../../../../../store/selectors/adminJobsSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import useGroupFromState from "../../../../../custom-hook/useGroupFromState"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { URL_REGEX } from "../../../../../util/constants"
import SteppedDialog, {
   useStepper,
} from "../../../../stepped-dialog/SteppedDialog"

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      mt: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   form: {
      my: "40px",
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   cancelBtn: {
      color: "neutral.500",
   },
})

const JobForm = dynamic(() => import("./JobForm"), {
   ssr: false,
   loading: () => <CircularProgress />,
})

type Props = {
   afterCreateCustomJob?: (job: PublicCustomJob) => void
   afterUpdateCustomJob?: (job: PublicCustomJob) => void
}

const JobFormDialog: FC<Props> = ({
   afterCreateCustomJob,
   afterUpdateCustomJob,
}) => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { group } = useGroupFromState()
   const { handleClose } = useStepper()
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const quillInputRef = useRef()

   const handleSubmit = useCallback(
      async (values: JobFormValues) => {
         try {
            const formattedJob: PublicCustomJob = {
               ...values,
               jobType: values.jobType as JobType,
               deadline: Timestamp.fromDate(values.deadline),
               postingUrl:
                  values.postingUrl.indexOf("http") === 0
                     ? values.postingUrl
                     : `https://${values.postingUrl}`,
            }

            if (selectedJobId) {
               await customJobRepo.updateCustomJob(formattedJob)
               afterUpdateCustomJob && afterUpdateCustomJob(formattedJob)

               successNotification("Job successfully updated")
            } else {
               const createdJob = await customJobRepo.createCustomJob(
                  formattedJob
               )
               afterCreateCustomJob && afterCreateCustomJob(createdJob)

               successNotification("Job successfully created")
            }
         } catch (error) {
            errorNotification(error, "An error has occurred")
         } finally {
            handleClose()
         }
      },
      [
         selectedJobId,
         afterUpdateCustomJob,
         successNotification,
         afterCreateCustomJob,
         errorNotification,
         handleClose,
      ]
   )

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <JobFetchWrapper jobId={selectedJobId}>
            {(job) => (
               <Formik<JobFormValues>
                  initialValues={getInitialValues(job, group.groupId)}
                  onSubmit={handleSubmit}
                  validationSchema={() => validationSchema(quillInputRef)}
               >
                  {({ dirty, handleSubmit, isSubmitting, isValid }) => (
                     <SteppedDialog.Container
                        containerSx={styles.content}
                        withActions
                     >
                        <>
                           <SteppedDialog.Content sx={styles.container}>
                              <>
                                 <SteppedDialog.Title sx={styles.title}>
                                    {selectedJobId ? "Editing " : "Create a "}
                                    <Box
                                       component="span"
                                       color="secondary.main"
                                    >
                                       job posting
                                    </Box>
                                 </SteppedDialog.Title>

                                 <SteppedDialog.Subtitle sx={styles.subtitle}>
                                    Share with your audience the details about
                                    your job opening!
                                 </SteppedDialog.Subtitle>

                                 <Box sx={styles.form}>
                                    <JobForm quillInputRef={quillInputRef} />
                                 </Box>
                              </>
                           </SteppedDialog.Content>

                           <SteppedDialog.Actions>
                              <SteppedDialog.Button
                                 variant="outlined"
                                 color="grey"
                                 onClick={handleClose}
                                 sx={styles.cancelBtn}
                              >
                                 Cancel
                              </SteppedDialog.Button>

                              <SteppedDialog.Button
                                 variant="contained"
                                 color={"secondary"}
                                 disabled={isSubmitting || !isValid || !dirty}
                                 type="submit"
                                 onClick={() => handleSubmit()}
                                 loading={isSubmitting}
                              >
                                 {selectedJobId
                                    ? isSubmitting
                                       ? "Saving"
                                       : "Save"
                                    : isSubmitting
                                    ? "Creating"
                                    : "Create"}
                              </SteppedDialog.Button>
                           </SteppedDialog.Actions>
                        </>
                     </SteppedDialog.Container>
                  )}
               </Formik>
            )}
         </JobFetchWrapper>
      </SuspenseWithBoundary>
   )
}

/**
 * Ensure that the 'jobType' field is initialized as an empty string at the start of any form.
 * Additionally, use the 'Date' data type instead of 'Timestamp' within the form.
 */
export type JobFormValues = {
   jobType: string
   deadline: Date
   noDateValidation: boolean
} & Omit<PublicCustomJob, "jobType" | "deadline">

const getInitialValues = (
   job: PublicCustomJob,
   groupId: string
): JobFormValues => {
   // If the 'job' field is received, it indicates the intention to edit an existing job.
   if (job) {
      let pastJob = false

      if (job.deadline?.toDate() < new Date()) {
         // The deadline for this job has already expired
         // In this case, we will proceed to update the job fields without validating the deadline
         pastJob = true
      }

      return {
         ...job,
         deadline: job.deadline?.toDate(),
         noDateValidation: pastJob,
      }
   }

   return {
      id: uuidv4(),
      groupId: groupId,
      title: "",
      salary: "",
      description: "",
      deadline: null,
      postingUrl: "",
      jobType: "",
      noDateValidation: false,
   }
}

const validationSchema = (quillRef) => {
   return Yup.object().shape({
      title: yup.string().required("Required"),
      description: yup
         .string()
         .transform(() =>
            quillRef?.current?.unprivilegedEditor.getText().replace(/\n$/, "")
         ) //ReactQuill appends a new line to text
         .required("Required")
         .min(
            CUSTOM_JOB_CONSTANTS.MIN_DESCRIPTION_LENGTH,
            `Must be at least ${CUSTOM_JOB_CONSTANTS.MIN_DESCRIPTION_LENGTH} characters`
         )
         .max(
            CUSTOM_JOB_CONSTANTS.MAX_DESCRIPTION_LENGTH,
            `Must be less than ${CUSTOM_JOB_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`
         ),
      salary: yup.string(),
      noDateValidation: yup.boolean(),
      deadline: yup
         .date()
         .when("noDateValidation", {
            is: false,
            then: yup
               .date()
               .nullable()
               .min(new Date(), "The date must be in the future"),
         })
         .required("Required"),
      postingUrl: yup
         .string()
         .matches(URL_REGEX, { message: "Must be a valid url" })
         .required("Required"),
      jobType: yup.string().required("Required"),
   })
}
export default JobFormDialog
