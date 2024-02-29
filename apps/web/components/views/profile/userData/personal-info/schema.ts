import { URL_REGEX } from "components/util/constants"
import * as Yup from "yup"

export const personalInfoSchema = Yup.object({
   firstName: Yup.string()
      .trim()
      .min(2, "Cannot be shorter than 2 characters")
      .max(50, "Cannot be longer than 50 characters")
      .required("Required"),
   lastName: Yup.string()
      .trim()
      .min(2, "Cannot be shorter than 2 characters")
      .max(50, "Cannot be longer than 50 characters")
      .required("Required"),
   linkedinUrl: Yup.string()
      .trim()
      .nullable()
      .test(
         "is-valid-url",
         "Please enter a valid URL",
         (value) => !value || URL_REGEX.test(value) // Only test the URL_REGEX if value is not empty
      ),
   fieldOfStudy: Yup.object({
      value: Yup.string().required("Please select a field of study"),
      id: Yup.string().required("Please select a field of study"),
   }).required("Please select a field of study"),
   levelOfStudy: Yup.object({
      value: Yup.string().required("Please select a level of study"),
      id: Yup.string().required("Please select a level of study"),
   }).required("Please select a level of study"),
   universityCountryCode: Yup.string().required("Please chose a country code"),
   university: Yup.object({
      id: Yup.string().required("Please enter the university code"),
      value: Yup.string().required("Please enter the university name"),
   })
      .typeError("Please select a university")
      .required("Please select a university"),
   unsubscribed: Yup.boolean().required(),
})

export type PersonalInfoFormValues = Yup.InferType<typeof personalInfoSchema>
