import { getBusinessTagsByIds } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJob,
   CustomJobWorkplace,
   JobType,
   PublicCustomJob,
   workplaceOptionsMap,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups/groups"
import { yupResolver } from "@hookform/resolvers/yup"
import useGroupFromState from "components/custom-hook/useGroupFromState"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { customJobRepo } from "data/RepositoryInstances"
import { Timestamp } from "firebase/firestore"
import {
   MutableRefObject,
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
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

type CustomJobFormContextType = {
   handleSubmit: (values: JobFormValues) => Promise<void>
   isSubmitting: boolean
}

const CustomJobFormContext = createContext<CustomJobFormContextType>({
   handleSubmit: () => null,
   isSubmitting: false,
})

export const getInitialValues = (
   job: CustomJob,
   group: Group
): JobFormValues => {
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
      groupId: group.groupId,
      basicInfo: {
         title: "",
         jobType: null,
         businessTags: [],
         workplace: workplaceOptionsMap["on-site"].id,
         jobLocation: [
            { id: group.companyCountry?.id, value: group.companyCountry?.name },
         ],
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
   const [isSubmitting, setIsSubmitting] = useState(false)

   const handleSubmit = useCallback(
      async (values: JobFormValues) => {
         try {
            setIsSubmitting(true)

            const {
               basicInfo: {
                  jobType,
                  businessTags,
                  workplace,
                  jobLocation,
                  ...basicInfoRest
               },
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
               jobLocation:
                  jobLocation?.map((el) => ({ id: el.id, name: el.value })) ??
                  [],
               businessFunctionsTagIds,
               jobType: jobType ? (jobType.value as JobType) : null,
               workplace: workplace ? (workplace as CustomJobWorkplace) : null,
               deadline: Timestamp.fromDate(deadline),
               group: group,
               postingUrl:
                  postingUrl.indexOf("http") === 0
                     ? postingUrl
                     : `https://${postingUrl}`,
               livestreams: livestreamIds ?? [],
               sparks: sparkIds ?? [],
               isPermanentlyExpired: false,
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
         } finally {
            setIsSubmitting(false)
         }
      },
      [
         selectedJobId,
         job,
         afterUpdateCustomJob,
         successNotification,
         afterCreateCustomJob,
         errorNotification,
         group,
      ]
   )

   const contextValue = useMemo(
      () => ({ handleSubmit, isSubmitting }),
      [handleSubmit, isSubmitting]
   )

   const formMethods = useForm<JobFormValues>({
      resolver: yupResolver(schema(quillInputRef)),
      defaultValues: getInitialValues(job, group),
      mode: "onChange",
   })

   return (
      <CustomJobFormContext.Provider value={contextValue}>
         <FormProvider {...formMethods}>
            <form>{children}</form>
         </FormProvider>
      </CustomJobFormContext.Provider>
   )
}

const useCustomJobForm = () =>
   useContext<CustomJobFormContextType>(CustomJobFormContext)

export { CustomJobFormProvider, useCustomJobForm }

const mapBasicInfo = ({
   title,
   jobType,
   businessFunctionsTagIds,
   workplace,
   jobLocation,
}: CustomJob): BasicInfoValues => ({
   title,
   jobType: jobType ? { value: jobType, label: jobType, id: jobType } : null,
   businessTags: getBusinessTagsByIds(businessFunctionsTagIds),
   workplace,
   jobLocation: jobLocation?.map((el) => ({ id: el.id, value: el.name })) ?? [],
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
