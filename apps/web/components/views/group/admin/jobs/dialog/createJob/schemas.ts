import { CUSTOM_JOB_CONSTANTS } from "@careerfairy/shared-lib/customJobs/constants"
import { workplaceOptions } from "@careerfairy/shared-lib/customJobs/customJobs"
import * as Yup from "yup"

export const jobFormValidationSchema = (quillRef) =>
   Yup.object({
      id: Yup.string().required(),
      groupId: Yup.string().required(),
      basicInfo: basicInfoSchema,
      additionalInfo: additionalInfoSchema(quillRef),
   })

const groupOptionShape = Yup.object({
   id: Yup.string().required(),
   name: Yup.string().required(),
})

export const basicInfoSchema = Yup.object({
   title: Yup.string().required("Job title is required"),
   jobType: Yup.object({
      value: Yup.string().required(),
      label: Yup.string().required(),
      id: Yup.string().required(),
   }).nullable(),
   businessTags: Yup.array()
      .of(groupOptionShape)
      .min(
         CUSTOM_JOB_CONSTANTS.MIN_BUSINESS_TAGS,
         `Must select at least ${CUSTOM_JOB_CONSTANTS.MIN_BUSINESS_TAGS} business option`
      )
      .required("Business option is required"),
   workplace: Yup.string().oneOf(
      workplaceOptions.map((option) => option.value)
   ),
   jobLocation: Yup.string(),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const additionalInfoSchema = (quillRef) =>
   Yup.object({
      salary: Yup.string().optional().nullable(),
      description: Yup.string()
         .transform((value) =>
            quillRef?.current
               ? quillRef.current.unprivilegedEditor
                    .getText()
                    .replace(/\n$/, "") //ReactQuill appends a new line to text
               : value
         )
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

export type BasicInfoValues = Yup.InferType<typeof basicInfoSchema>

export type AdditionalInfoValues = Yup.InferType<
   ReturnType<typeof additionalInfoSchema>
>

export const schema = (quillRef) =>
   Yup.object({
      id: Yup.string().required(),
      groupId: Yup.string().required(),
      basicInfo: basicInfoSchema,
      additionalInfo: additionalInfoSchema(quillRef),
      livestreamIds: Yup.array(Yup.string()),
      sparkIds: Yup.array(Yup.string()),
   })

//  export interface JobFormValues extends Yup.InferType<typeof schema>{
export type JobFormValues = {
   id: string
   groupId: string
   basicInfo: BasicInfoValues
   additionalInfo: AdditionalInfoValues
   livestreamIds: string[]
   sparkIds: string[]
}

export type JobLinkedContentValues = {
   livestreamIds: string[]
   sparkIds: string[]
}

export const jobLinkedContentSchema = Yup.object({
   livestreamIds: Yup.array(Yup.string()),
   sparkIds: Yup.array(Yup.string()),
})
