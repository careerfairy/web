import { getBusinessTagsByIds } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJob,
   JobType,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { yupResolver } from "@hookform/resolvers/yup"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { customJobRepo } from "data/RepositoryInstances"
import { Timestamp } from "firebase/firestore"
import { MutableRefObject, ReactNode, useCallback } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { jobsFormSelectedJobIdSelector } from "store/selectors/adminJobsSelectors"
import DateUtil from "util/DateUtil"
import { v4 as uuidv4 } from "uuid"
import {
   AdditionalInfoValues,
   BasicInfoValues,
   JobFormValues,
   schema,
} from "./createJob/schemas"

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

      if (DateUtil.isDeadlineExpired(job.deadline?.toDate())) {
         // The deadline for this job has already expired
         // In this case, we will proceed to update the job fields without validating the deadline
         pastJob = true
      }

      return {
         id: job.id,
         groupId: job.groupId,
         basicInfo: mapBasicInfo(job),
         additionalInfo: mapAdditionalInfo(job, pastJob),
         livestreamIds: job.livestreams,
         sparkIds: job.sparks,
      }
   }

   return {
      id: uuidv4(),
      groupId: groupId,
      basicInfo: {
         title: "",
         jobType: null,
         businessTags: [],
      },
      additionalInfo: {
         salary: "",
         description: "",
         deadline: null,
         postingUrl: "",
         noDateValidation: false,
      },
      livestreamIds: [],
      sparkIds: [],
   }
}

const CustomJobFormProvider = ({
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
               livestreamIds,
               sparkIds,
            } = values

            const businessFunctionsTagIds = businessTags.map((el) => el.id)

            const formattedJob: PublicCustomJob = {
               ...basicInfoRest,
               ...additionalInfoRest,
               id,
               groupId,
               businessFunctionsTagIds,
               jobType: jobType ? (jobType.value as JobType) : null,
               deadline: Timestamp.fromDate(deadline),
               postingUrl:
                  postingUrl.indexOf("http") === 0
                     ? postingUrl
                     : `https://${postingUrl}`,
               livestreams: livestreamIds ?? [],
               sparks: sparkIds ?? [],
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

   const formMethods = useForm<JobFormValues>({
      resolver: yupResolver(schema(quillInputRef)),
      defaultValues: getInitialValues(job, group.groupId),
      mode: "onChange",
   })

   return (
      <FormProvider {...formMethods}>
         <form
            id="custom-job-form"
            onSubmit={formMethods.handleSubmit(handleSubmit)}
         >
            {children}
         </form>
      </FormProvider>
   )
}

export default CustomJobFormProvider

const mapBasicInfo = ({
   title,
   jobType,
   businessFunctionsTagIds,
}: CustomJob): BasicInfoValues => ({
   title,
   jobType: jobType ? { value: jobType, label: jobType, id: jobType } : null,
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
