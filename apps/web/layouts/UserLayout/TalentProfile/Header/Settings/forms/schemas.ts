import { UserData } from "@careerfairy/shared-lib/users"
import * as Yup from "yup"

export const personalInfoShape = {
   firstName: Yup.string().required("First name is required"),
   lastName: Yup.string().required("Last name is required"),
   countryIsoCode: Yup.string().required("Country is required"),
   stateIsoCode: Yup.string().required("State is required"),
   cityIsoCode: Yup.string().required("City is required"),
   email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
}

export const privacyShape = {
   unsubscribed: Yup.boolean(),
}

export const PersonalInfoSchema = Yup.object(personalInfoShape)

export const PrivacySchema = Yup.object(privacyShape)

export type PersonalInfoSchemaType = Yup.InferType<typeof PersonalInfoSchema>

export type PrivacySchemaType = Yup.InferType<typeof PrivacySchema>

export type PersonalInfoFormValues = {
   firstName: string
   lastName: string
   countryIsoCode: string
   stateIsoCode: string
   cityIsoCode: string
   email: string
}

export type PrivacyFormValues = {
   unsubscribed: boolean
}

export const getInitialPersonalInfoValues = (
   personalInfo?: UserData
): PersonalInfoFormValues => {
   return {
      firstName: personalInfo?.firstName || "",
      lastName: personalInfo?.lastName || "",
      countryIsoCode: personalInfo?.countryIsoCode
         ? personalInfo?.countryIsoCode
         : personalInfo?.universityCountryCode || "",
      stateIsoCode: personalInfo?.stateIsoCode || "",
      cityIsoCode: personalInfo?.cityIsoCode || "",
      email: personalInfo?.userEmail || "",
   }
}

export const getInitialPrivacyValues = (
   userData?: UserData
): PrivacyFormValues => {
   return {
      unsubscribed: userData?.unsubscribed || false,
   }
}
