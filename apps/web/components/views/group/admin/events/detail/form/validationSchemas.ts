import * as yup from "yup"

const livestreamFormGeneralTabSchema = yup.object().shape({
   title: yup.string().required("Required"),
})

const livestreamFormSpeakersTabSchema = yup.object().shape({
   title: yup.string().required("Required"),
})

const livestreamFormQuestionsTabSchema = yup.object().shape({
   title: yup.string().required("Required"),
})

const livestreamFormJobsTabSchema = yup.object().shape({
   title: yup.string().required("Required"),
})

const livestreamFormValidationSchema = livestreamFormGeneralTabSchema
   .concat(livestreamFormSpeakersTabSchema)
   .concat(livestreamFormQuestionsTabSchema)
   .concat(livestreamFormJobsTabSchema)

export {
   livestreamFormGeneralTabSchema,
   livestreamFormSpeakersTabSchema,
   livestreamFormQuestionsTabSchema,
   livestreamFormJobsTabSchema,
   livestreamFormValidationSchema,
}
