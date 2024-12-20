import { UserData } from "@careerfairy/shared-lib/users"
import * as Yup from "yup"

export const personalInfoShape = {
   firstName: Yup.string().required("First name is required"),
   lastName: Yup.string().required("Last name is required"),
   countryCode: Yup.string().required("Country is required"),
   city: Yup.string().required("City is required"),
   email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
}

export const PersonalInfoSchema = Yup.object(personalInfoShape)

export type PersonalInfoSchemaType = Yup.InferType<typeof PersonalInfoSchema>

export type PersonalInfoFormValues = {
   firstName: string
   lastName: string
   countryCode: string
   city: string
   email: string
}

export const getInitialPersonalInfoValues = (
   personalInfo?: UserData
): PersonalInfoFormValues => {
   return {
      firstName: personalInfo?.firstName || "",
      lastName: personalInfo?.lastName || "",
      countryCode: personalInfo?.universityCountryCode || "",
      // TODO-WG: get city from user profile
      city: personalInfo?.authId || "",
      email: personalInfo?.userEmail || "",
   }
}
