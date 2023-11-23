import { useDispatch, useSelector } from "react-redux"
import {
   jobsFormDialogOpenSelector,
   jobsFormSelectedJobIdSelector,
} from "../../../../../store/selectors/adminJobsSelectors"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import SteppedDialog, {
   useStepper,
} from "../../../stepped-dialog/SteppedDialog"
import React, { useCallback } from "react"
import { closeJobFormDialog } from "../../../../../store/reducers/adminJobsReducer"
import { sxStyles } from "../../../../../types/commonTypes"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import * as Yup from "yup"
import { Formik } from "formik"
import JobFetchWrapper from "../../../../../HOCs/job/JobFetchWrapper"
import { v4 as uuidv4 } from "uuid"
import {
   CustomJob,
   JobType,
   PublicCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import * as yup from "yup"
import { URL_REGEX } from "../../../../util/constants"
import { Box } from "@mui/material"
import JobForm from "./JobForm"
import { Timestamp } from "../../../../../data/firebase/FirebaseInstance"
import { groupRepo } from "../../../../../data/RepositoryInstances"

const styles = sxStyles({
   wrapContainer: {
      height: {
         md: "100%",
      },
   },
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
   header: {},
})

const JobFormDialog = () => {
   const dispatch = useDispatch()
   const isOpen = useSelector(jobsFormDialogOpenSelector)

   const handleClose = () => {
      dispatch(closeJobFormDialog())
   }

   if (!isOpen) {
      return null
   }

   return (
      <SteppedDialog
         key={isOpen ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleClose}
         open={isOpen}
         views={view}
      />
   )
}

const Content = () => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { group } = useGroupFromState()
   const { handleClose } = useStepper()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const handleSubmit = useCallback(
      async (values: JobFormValues) => {
         try {
            const formattedJob: PublicCustomJob = {
               ...values,
               jobType: values.jobType as JobType,
               deadline: values.deadline
                  ? Timestamp.fromDate(values.deadline)
                  : null,
               postingUrl:
                  values.postingUrl.indexOf("http") === 0
                     ? values.postingUrl
                     : `https://${values.postingUrl}`,
            }

            if (selectedJobId) {
               await groupRepo.updateGroupCustomJob(formattedJob, group.groupId)
               successNotification("Job successfully updated")
            } else {
               await groupRepo.createGroupCustomJob(formattedJob, group.groupId)
               successNotification("Job successfully created")
            }
         } catch (error) {
            errorNotification(error, "An error has occurred")
         }
      },
      [selectedJobId, group.groupId, successNotification, errorNotification]
   )

   return (
      <JobFetchWrapper
         jobId={selectedJobId}
         groupId={group.groupId}
         shouldFetch={Boolean(selectedJobId)}
      >
         {(job) => (
            <Formik<JobFormValues>
               initialValues={getInitialValues(job, group.groupId)}
               onSubmit={handleSubmit}
               validationSchema={validationSchema(job)}
               enableReinitialize
            >
               {({ dirty, handleSubmit, isSubmitting, isValid }) => (
                  <SteppedDialog.Container
                     containerSx={styles.content}
                     sx={styles.wrapContainer}
                     withActions
                  >
                     <>
                        <SteppedDialog.Content sx={styles.container}>
                           <>
                              {/*<Box sx={styles.header}>*/}
                              <SteppedDialog.Title sx={styles.title}>
                                 Create a{" "}
                                 <Box component="span" color="secondary.main">
                                    job posting
                                 </Box>
                              </SteppedDialog.Title>

                              <SteppedDialog.Subtitle sx={styles.subtitle}>
                                 Share with your audience the details about your
                                 job opening!
                              </SteppedDialog.Subtitle>
                              {/*</Box>*/}
                              <Box sx={styles.form}>
                                 <JobForm />
                              </Box>
                           </>
                        </SteppedDialog.Content>

                        <SteppedDialog.Actions>
                           <SteppedDialog.Button
                              variant="outlined"
                              color="grey"
                              onClick={handleClose}
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
                              {selectedJobId ? "Update" : "create"}
                           </SteppedDialog.Button>
                        </SteppedDialog.Actions>
                     </>
                  </SteppedDialog.Container>
               )}
            </Formik>
         )}
      </JobFetchWrapper>
   )
}

const view = [
   {
      key: "select-creator",
      Component: () => <Content />,
   },
]

/**
 * Ensure that the 'jobType' field is initialized as an empty string at the start of any form.
 * Additionally, use the 'Date' data type instead of 'Timestamp' within the form.
 */
export type JobFormValues = {
   jobType: string
   deadline: Date
} & Omit<PublicCustomJob, "jobType" | "deadline">

const getInitialValues = (
   job: PublicCustomJob,
   groupId: string
): JobFormValues => {
   // If the 'job' field is received, it indicates the intention to edit an existing job.
   if (job) {
      return {
         ...job,
         deadline: job.deadline?.toDate(),
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
   }
}

const validationSchema = (job?: CustomJob) => {
   let pastJob = false

   if (job?.deadline.toDate() < new Date()) {
      // The deadline for this job has already expired
      // In this case, we will proceed to update the job fields without validating the deadline
      pastJob = true
   }

   return Yup.object().shape({
      title: yup.string().required("Required"),
      description: yup.string().required("Required"),
      salary: yup.string(),
      ...(pastJob
         ? {}
         : {
              deadline: yup
                 .date()
                 .nullable()
                 .min(new Date(), `The date must be in the future`),
           }),
      postingUrl: yup
         .string()
         .matches(URL_REGEX, { message: "Must be a valid url" })
         .required("Required"),
      jobType: yup.string().required("Required"),
   })
}
export default JobFormDialog
