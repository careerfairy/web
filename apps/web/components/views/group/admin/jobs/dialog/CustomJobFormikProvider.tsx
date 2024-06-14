import { CUSTOM_JOB_CONSTANTS } from "@careerfairy/shared-lib/customJobs/constants"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Formik } from "formik"
import { FC, MutableRefObject, ReactNode } from "react"
import * as Yup from "yup"

export type JobFormValues = {
   title: string
   jobType?: string
   businessOption: string
   salary?: string
   description: string
   deadline: Date
   postingUrl: string
   noDateValidation: boolean
}

const jobFormValidationSchema = (quillRef) =>
   Yup.object().shape({
      title: Yup.string().required("Job title is required"),
      jobType: Yup.string(),
      businessOption: Yup.string().required("Business option is required"),
      salary: Yup.string(),
      description: Yup.string()
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
      postingUrl: Yup.string()
         .url("Invalid URL")
         .required("Job posting URL is required"),
      deadline: Yup.date()
         .when("noDateValidation", {
            is: false,
            then: Yup.date()
               .nullable()
               .min(new Date(), "The date must be in the future"),
         })
         .required("Application deadline is required"),
      noDateValidation: Yup.boolean(),
   })

type Props = {
   job: CustomJob
   children: ReactNode
   quillInputRef: MutableRefObject<undefined>
}

const getInitialValues = (job: CustomJob): JobFormValues => {
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
         businessOption: "",
         deadline: job.deadline?.toDate(),
         noDateValidation: pastJob,
      }
   }

   return {
      title: "",
      jobType: "",
      businessOption: "",
      salary: "",
      description: "",
      deadline: null,
      postingUrl: "",
      noDateValidation: false,
   }
}

const JobFormikProvider: FC<Props> = ({ job, children, quillInputRef }) => {
   return (
      <Formik<JobFormValues>
         initialValues={getInitialValues(job)}
         onSubmit={undefined}
         validationSchema={() => jobFormValidationSchema(quillInputRef)}
      >
         {children}
      </Formik>
   )
}

export default JobFormikProvider
