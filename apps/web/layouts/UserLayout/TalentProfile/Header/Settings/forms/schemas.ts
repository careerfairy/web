import { UserData } from "@careerfairy/shared-lib/users"
import { validatePassword } from "@careerfairy/shared-lib/utils/password"
import * as Yup from "yup"

export const personalInfoShape = {
   firstName: Yup.string().required("First name is required"),
   lastName: Yup.string().required("Last name is required"),
   countryIsoCode: Yup.string().optional(),
   stateIsoCode: Yup.string().optional(),
   cityIsoCode: Yup.string().optional(),
   email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
}

export const privacyShape = {
   unsubscribed: Yup.boolean(),
}

export const passwordShape = {
   currentPassword: Yup.string().required("Current password is required"),

   newPassword: Yup.string()
      .required("New password is required")
      .test("password-validation", "", function (value) {
         if (!value)
            return this.createError({ message: "New password is required" })
         const validationResult = validatePassword(value)
         return validationResult === true
            ? true
            : this.createError({ message: validationResult })
      })
      .notOneOf(
         [Yup.ref("currentPassword")],
         "New password must be different from current password"
      ),

   confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords do not match!"),
}

export const PersonalInfoSchema = Yup.object(personalInfoShape)

export const PrivacySchema = Yup.object(privacyShape)

export const PasswordSchema = Yup.object(passwordShape)

export type PersonalInfoSchemaType = Yup.InferType<typeof PersonalInfoSchema>

export type PrivacySchemaType = Yup.InferType<typeof PrivacySchema>

export type PasswordSchemaType = Yup.InferType<typeof PasswordSchema>

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

export type PasswordFormValues = {
   currentPassword: string
   newPassword: string
   confirmPassword: string
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

export const getInitialPasswordValues = (): PasswordFormValues => {
   return {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
   }
}
