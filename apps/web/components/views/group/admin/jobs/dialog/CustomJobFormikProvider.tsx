import { getBusinessTagsByIds } from "@careerfairy/shared-lib/constants/tags"
import { CUSTOM_JOB_CONSTANTS } from "@careerfairy/shared-lib/customJobs/constants"
import {
   CustomJob,
   JobType,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { customJobRepo } from "data/RepositoryInstances"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { Formik } from "formik"
import { MutableRefObject, ReactNode, useCallback } from "react"
import { useSelector } from "react-redux"
import { jobsFormSelectedJobIdSelector } from "store/selectors/adminJobsSelectors"
import { v4 as uuidv4 } from "uuid"
import * as Yup from "yup"
import {
   AdditionalInfoValues,
   BasicInfoValues,
   JobFormValues,
} from "./createJob/types"

const jobFormValidationSchema = (quillRef) =>
   Yup.object().shape({
      basicInfo: basicInfoSchema,
      additionalInfo: additionalInfoSchema(quillRef),
   })

type Props = {
   job: CustomJob
   children: ReactNode
   quillInputRef: MutableRefObject<any>
   afterCreateCustomJob?: (job: CustomJob) => void
   afterUpdateCustomJob?: (job: CustomJob) => void
}

const getInitialValues = (job: CustomJob, groupId: string): JobFormValues => {
   // If the 'job' field is received, it indicates the intention to edit an existing job.
   if (job) {
      let pastJob = false

      if (job.deadline?.toDate() < new Date()) {
         // The deadline for this job has already expired
         // In this case, we will proceed to update the job fields without validating the deadline
         pastJob = true
      }

      return {
         id: job.id,
         groupId: job.groupId,
         basicInfo: mapBasicInfo(job),
         additionalInfo: mapAdditionalInfo(job, pastJob),
      }
   }

   return {
      id: uuidv4(),
      groupId: groupId,
      basicInfo: {
         title: "",
         jobType: "",
         businessTags: [],
      },
      additionalInfo: {
         salary: "",
         description: "",
         deadline: null,
         postingUrl: "",
         noDateValidation: false,
      },
   }
}

const JobFormikProvider = ({
   job,
   children,
   quillInputRef,
   afterCreateCustomJob,
   afterUpdateCustomJob,
}: Props) => {
   const selectedJobId = useSelector(jobsFormSelectedJobIdSelector)
   const { group } = useGroupFromState()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const handleSubmit = useCallback(
      async (values: JobFormValues) => {
         try {
            const {
               basicInfo: { jobType, businessTags, ...basicInfoRest },
               additionalInfo: { deadline, postingUrl, ...additionalInfoRest },
               id,
               groupId,
            } = values

            const businessFunctionsTagIds = businessTags.map((el) => el.id)

            const formattedJob: PublicCustomJob = {
               ...basicInfoRest,
               ...additionalInfoRest,
               id,
               groupId,
               businessFunctionsTagIds,
               jobType: jobType as JobType,
               deadline: Timestamp.fromDate(deadline),
               postingUrl:
                  postingUrl.indexOf("http") === 0
                     ? postingUrl
                     : `https://${postingUrl}`,
            }

            if (selectedJobId) {
               const updatedJob: CustomJob = {
                  ...job,
                  ...formattedJob,
               }

               await customJobRepo.updateCustomJob(updatedJob)
               afterUpdateCustomJob && afterUpdateCustomJob(updatedJob)

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
         }
      },
      [
         selectedJobId,
         job,
         afterUpdateCustomJob,
         successNotification,
         afterCreateCustomJob,
         errorNotification,
      ]
   )

   return (
      <Formik<JobFormValues>
         initialValues={getInitialValues(job, group.groupId)}
         onSubmit={handleSubmit}
         validationSchema={() => jobFormValidationSchema(quillInputRef)}
      >
         {children}
      </Formik>
   )
}

export default JobFormikProvider

const groupOptionShape = Yup.object().shape({
   id: Yup.string().required(),
   name: Yup.string().required(),
})

export const basicInfoSchema = Yup.object().shape({
   title: Yup.string().required("Job title is required"),
   jobType: Yup.string(),
   businessTags: Yup.array()
      .of(groupOptionShape)
      .min(
         CUSTOM_JOB_CONSTANTS.MIN_BUSINESS_TAGS,
         `Must select at least ${CUSTOM_JOB_CONSTANTS.MIN_BUSINESS_TAGS} business option`
      )
      .required("Business option is required"),
})

const additionalInfoSchema = (quillRef) =>
   Yup.object().shape({
      salary: Yup.string(),
      description: Yup.string()
         .transform(() =>
            quillRef?.current?.unprivilegedEditor.getText().replace(/\n$/, "")
         ) //ReactQuill appends a new line to text
         .required("Description is required")
         .min(
            CUSTOM_JOB_CONSTANTS.MIN_DESCRIPTION_LENGTH,
            `Must be at least ${CUSTOM_JOB_CONSTANTS.MIN_DESCRIPTION_LENGTH} characters`
         )
         .max(
            CUSTOM_JOB_CONSTANTS.MAX_DESCRIPTION_LENGTH,
            `Must be less than ${CUSTOM_JOB_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`
         ),
      postingUrl: Yup.string()
         .url("Invalid URL")
         .required("Job posting URL is required"),
      noDateValidation: Yup.boolean(),
      deadline: Yup.date()
         .when("noDateValidation", {
            is: false,
            then: Yup.date()
               .nullable()
               .min(new Date(), "The date must be in the future"),
         })
         .required("Application deadline is required"),
   })

const mapBasicInfo = ({
   title,
   jobType,
   businessFunctionsTagIds,
}: CustomJob): BasicInfoValues => ({
   title,
   jobType,
   businessTags: getBusinessTagsByIds(businessFunctionsTagIds),
})

const mapAdditionalInfo = (
   { salary, description, deadline, postingUrl }: CustomJob,
   noDateValidation: boolean
): AdditionalInfoValues => ({
   salary,
   description,
   postingUrl,
   deadline: deadline?.toDate(),
   noDateValidation,
})
