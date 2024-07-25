import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { yupResolver } from "@hookform/resolvers/yup"
import { ReactNode } from "react"
import { FormProvider, useForm } from "react-hook-form"
import {
   JobLinkedContentValues,
   jobLinkedContentSchema,
} from "../../dialog/createJob/schemas"

type Props = {
   job: CustomJob
   children: ReactNode
}
const LinkedContentFormProvider = ({ job, children }: Props) => {
   const formMethods = useForm<JobLinkedContentValues>({
      resolver: yupResolver(jobLinkedContentSchema),
      defaultValues: getInitialValues(job),
      mode: "onChange",
   })

   return (
      <FormProvider {...formMethods}>
         <form>{children}</form>
      </FormProvider>
   )
}

export default LinkedContentFormProvider

const getInitialValues = (job: CustomJob): JobLinkedContentValues => ({
   livestreamIds: job.livestreams,
   sparkIds: job.sparks,
})
