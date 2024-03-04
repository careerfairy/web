import { URL_REGEX } from "components/util/constants"
import { ERROR_MESSAGES, maxLength, minLength } from "util/form"
import * as Yup from "yup"

export const personalInfoSchema = Yup.object({
   firstName: Yup.string()
      .trim()
      .min(...minLength(2))
      .max(...maxLength(50))
      .required(ERROR_MESSAGES.REQUIRED),
   lastName: Yup.string()
      .trim()
      .min(...minLength(2))
      .max(...maxLength(50))
      .required(ERROR_MESSAGES.REQUIRED),
   linkedinUrl: Yup.string().matches(URL_REGEX, {
      excludeEmptyString: true,
      message: ERROR_MESSAGES.VALID_URL,
   }),
   fieldOfStudy: Yup.object({
      value: Yup.string().required(ERROR_MESSAGES.SELECT_FIELD),
      id: Yup.string().required(ERROR_MESSAGES.SELECT_FIELD),
   }).required(ERROR_MESSAGES.SELECT_FIELD),
   levelOfStudy: Yup.object({
      value: Yup.string().required(),
      id: Yup.string().required(),
   }).required(ERROR_MESSAGES.SELECT_LEVEL),
   universityCountryCode: Yup.string().required(ERROR_MESSAGES.CHOOSE_COUNTRY),
   university: Yup.object({
      id: Yup.string().required(),
      value: Yup.string().required(),
   })
      .typeError(ERROR_MESSAGES.SELECT_UNIVERSITY)
      .required(ERROR_MESSAGES.SELECT_UNIVERSITY),
   unsubscribed: Yup.boolean().required(),
})

export type PersonalInfoFormValues = Yup.InferType<typeof personalInfoSchema>
