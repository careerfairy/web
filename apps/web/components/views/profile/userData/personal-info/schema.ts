import { URL_REGEX } from "components/util/constants"
import * as Yup from "yup"

export const personalInfoSchema = Yup.object({
   firstName: Yup.string()
      .min(5, "Cannot be shorter than 2 characters")
      .max(50, "Cannot be longer than 50 characters")
      .required("Required"),
   lastName: Yup.string()
      .matches(/^\D+$/i, "Please enter a valid last name")
      .max(50, "Cannot be longer than 50 characters")
      .required("Required"),
   linkedinUrl: Yup.string()
      .nullable()
      .test(
         "is-valid-url",
         "Please enter a valid URL",
         (value) => !value || URL_REGEX.test(value) // Only test the URL_REGEX if value is not empty
      ),
   universityCountryCode: Yup.string()
      .default("other")
      .required("Please chose a country code"),
   fieldOfStudy: Yup.object({
      name: Yup.string().required("Please select a field of study"),
      id: Yup.string().required("Please select a field of study"),
   })
      .nullable()
      .required("Please select a field of study"),
   levelOfStudy: Yup.object({
      name: Yup.string().required("Please select a level of study"),
      id: Yup.string().required("Please select a level of study"),
   }).required("Please select a level of study"),
   university: Yup.object({
      code: Yup.string().required("Please enter the university code"),
      name: Yup.string().required("Please enter the university name"),
   }).required("Please select a university"),
   unsubscribed: Yup.boolean().required(),
   email: Yup.string().email().required(),
})

export type PersonalInfo = Yup.InferType<typeof personalInfoSchema>
