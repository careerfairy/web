import * as yup from "yup"
import { URL_REGEX } from "../../../../util/constants"
import { basicEmailTemplate } from "constants/images"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useMemo } from "react"
import { shouldUseEmulators } from "../../../../../util/CommonUtil"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/src/utils/urls"

const MAX_SUBJECT_LENGTH = 500
const MAX_DISPLAY_TITLE_LENGTH = 1000
const MAX_SUMMARY_LENGTH = 5000
const requiredText = "Required"

const getMaxLengthError = (maxLength) => [
   maxLength,
   `This value is too long. It should have ${maxLength} characters or fewer.`,
]

const now = new Date()

const basicTemplateSchema = yup.object().shape({
   subject: yup
      .string("Enter the subject of the email")
      .max(...getMaxLengthError(MAX_SUBJECT_LENGTH))
      .required(requiredText),
   title: yup
      .string("Enter a title for the preview")
      .max(...getMaxLengthError(MAX_DISPLAY_TITLE_LENGTH))
      .required(requiredText),
   eventStartDate: yup
      .date("Enter the starting Date of the Event")
      .nullable()
      .min(now, `The date must be in the future`)
      .required(requiredText),
   companyLogoUrl: yup
      .string("Enter the image url of the company")
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required(requiredText),
   illustrationImageUrl: yup
      .string("Enter the image url the illustration image")
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required(requiredText),
   eventUrl: yup
      .string("Enter the url of the event")
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required(requiredText),
   summary: yup
      .string("Enter a summary")
      .max(...getMaxLengthError(MAX_SUMMARY_LENGTH))
      .required(requiredText),
})

const getInitialValues = (streamData) => ({
   subject: streamData.title || "",
   title: streamData.title || "",
   eventStartDate: streamData.start?.toDate?.(),
   companyLogoUrl: streamData.companyLogoUrl || "",
   illustrationImageUrl: streamData.backgroundImageUrl || "",
   eventUrl: streamData.id ? makeLivestreamEventDetailsUrl(streamData.id) : "",
   summary: streamData.summary || "",
})

const basicFields = [
   {
      name: "subject",
      type: "string",
      label: "Email Subject",
      maxLength: MAX_SUBJECT_LENGTH,
   },
   {
      label: "Event Title",
      type: "string",
      name: "title",
      maxLength: MAX_DISPLAY_TITLE_LENGTH,
   },
   {
      label: "Event Date",
      type: "date",
      name: "eventStartDate",
   },
   {
      label: "Company Logo Url",
      type: "image",
      name: "companyLogoUrl",
      path: "company-logos",
      small: true,
   },
   {
      label: "Illustration Url",
      type: "image",
      name: "illustrationImageUrl",
      path: "illustration-images",
      small: true,
   },
   {
      label: "Link to Event",
      type: "string",
      name: "eventUrl",
   },
   {
      label: "Event Summary",
      type: "string",
      name: "summary",
      multiLine: true,
      maxLength: MAX_SUMMARY_LENGTH,
      placeHolder: "Summarise the event here",
   },
]

const useTemplates = () => {
   const { sendBasicTemplateEmail } = useFirebaseService()
   return useMemo(
      () => [
         {
            templateImageUrl: basicEmailTemplate,
            templateName: "Basic",
            validationSchema: basicTemplateSchema,
            getInitialValues: getInitialValues,
            fields: basicFields,
            sendTemplate: sendBasicTemplateEmail,
            templateId: shouldUseEmulators() ? "28950430" : "25653565",
            templateEditUrl:
               "https://account.postmarkapp.com/servers/5274171/templates/25653565/edit",
         },
      ],
      [sendBasicTemplateEmail, shouldUseEmulators()]
   )
}

export default useTemplates
