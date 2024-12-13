import {
   LanguageProficiencies,
   LanguageProficiencyValues,
} from "@careerfairy/shared-lib/constants/forms"
import {
   BusinessFunctionsTags,
   ContentTopicsTags,
} from "@careerfairy/shared-lib/constants/tags"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import {
   ProfileInterest,
   ProfileLanguage,
   ProfileLink,
   StudyBackground,
   UserData,
} from "@careerfairy/shared-lib/users"
import { URL_REGEX } from "components/util/constants"
import { ERROR_MESSAGES } from "util/form"
import * as Yup from "yup"

const validBusinessFunctionTagIds = Object.values(BusinessFunctionsTags).map(
   (tag) => tag.id
)
const validContentTopicTagIds = Object.values(ContentTopicsTags).map(
   (tag) => tag.id
)

export const baseStudyBackgroundShape = {
   id: Yup.string(),
   universityCountryCode: Yup.string().required("School country is required"),
   universityId: Yup.string().required("School is required"),
   levelOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   })
      .nullable()
      .required("Level of study is required"),
   fieldOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   })
      .nullable()
      .required("Field of study is required"),
   startedAt: Yup.date()
      .nullable()
      .when("endedAt", {
         is: (val) => val != null, // Check if endedAt has a value
         then: Yup.date().required(
            "Start date is required when end date is provided"
         ),
      }),
   endedAt: Yup.date()
      .nullable()
      .test(
         "is-after-startedAt",
         "End date must be after start date",
         function (endedAt) {
            const { startedAt } = this.parent
            // Check if both dates are provided before validating
            return !startedAt || !endedAt || endedAt > startedAt
         }
      )
      .typeError("Please enter a valid end date"),
}

export const baseLinkShape = {
   id: Yup.string(),
   title: Yup.string().required("Title is required"),
   url: Yup.string()
      .matches(URL_REGEX, {
         excludeEmptyString: true,
         message: ERROR_MESSAGES.VALID_URL,
      })
      .required("URL is required"),
}

export const baseLanguageShape = {
   id: Yup.string(),
   languageId: Yup.string().nullable().required("Language is required"),
   proficiency: Yup.string()
      .nullable()
      .oneOf(Object.values(LanguageProficiencies), "Invalid proficiency level")
      .required("Proficiency is required"),
}

export const baseInterestShape = {
   businessFunctionsTagIds: Yup.array()
      .of(Yup.string().oneOf(validBusinessFunctionTagIds, "Invalid job area"))
      .nullable()
      .min(1, "At least one job area is required"),
   contentTopicsTagIds: Yup.array()
      .of(Yup.string().oneOf(validContentTopicTagIds, "Invalid content topic"))
      .nullable()
      .min(1, "At least one content topic is required"),
}

export const personalInfoShape = {
   firstName: Yup.string().required("First name is required"),
   lastName: Yup.string().required("Last name is required"),
   countryCode: Yup.string().required("Country is required"),
   city: Yup.string().required("City is required"),
   email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
}

export const CreateStudyBackgroundSchema = Yup.object(baseStudyBackgroundShape)

export const CreateLinkSchema = Yup.object(baseLinkShape)

export const CreateLanguageSchema = Yup.object(baseLanguageShape)

export const CreateInterestSchema = Yup.object(baseInterestShape)

export const PersonalInfoSchema = Yup.object(personalInfoShape)

export type CreateStudyBackgroundSchemaType = Yup.InferType<
   typeof CreateStudyBackgroundSchema
>

export type CreateLinkSchemaType = Yup.InferType<typeof CreateLinkSchema>

export type CreateLanguageSchemaType = Yup.InferType<
   typeof CreateLanguageSchema
>

export type CreateInterestSchemaType = Yup.InferType<
   typeof CreateInterestSchema
>

export type PersonalInfoSchemaType = Yup.InferType<typeof PersonalInfoSchema>

export type StudyBackgroundFormValues = {
   id?: string
   universityCountryCode: string
   universityId: string
   fieldOfStudy: FieldOfStudy
   levelOfStudy: LevelOfStudy
   startedAt?: Date
   endedAt?: Date
}

export type LinkFormValues = {
   id?: string
   title: string
   url: string
}

export type LanguageFormValues = {
   id?: string
   languageId: string
   proficiency: string
}

export type InterestFormValues = {
   businessFunctionsTagIds: string[]
   contentTopicsTagIds: string[]
}

export type PersonalInfoFormValues = {
   firstName: string
   lastName: string
   countryCode: string
   city: string
   email: string
}

export const getInitialStudyBackgroundValues = (
   studyBackground?: StudyBackground
): StudyBackgroundFormValues => {
   return {
      id: studyBackground?.id || "",
      universityCountryCode: studyBackground?.universityCountryCode || "",
      universityId: studyBackground?.universityId || "",
      fieldOfStudy: studyBackground?.fieldOfStudy || {
         id: "",
         name: "",
      },
      levelOfStudy: studyBackground?.levelOfStudy || {
         id: "",
         name: "",
      },
      startedAt: studyBackground?.startedAt?.toDate() || null,
      endedAt: studyBackground?.endedAt?.toDate() || null,
   }
}

export const getInitialLinkValues = (link?: ProfileLink): LinkFormValues => {
   return {
      id: link?.id || "",
      title: link?.title || "",
      url: link?.url || "",
   }
}

export const getInitialLanguageValues = (
   language?: ProfileLanguage
): LanguageFormValues => {
   const proficiency = language?.proficiency
      ? LanguageProficiencyValues[language.proficiency]
      : null

   return {
      id: language?.id || "",
      languageId: language?.languageId || "",
      proficiency: proficiency,
   }
}

export const getInitialInterestValues = (
   interest?: ProfileInterest
): InterestFormValues => {
   return {
      businessFunctionsTagIds: interest?.businessFunctionsTagIds?.length
         ? interest?.businessFunctionsTagIds
         : [],
      contentTopicsTagIds: interest?.contentTopicsTagIds?.length
         ? interest?.contentTopicsTagIds
         : [],
   }
}

export const getInitialPersonalInfoValues = (
   personalInfo?: UserData
): PersonalInfoFormValues => {
   return {
      firstName: personalInfo?.firstName || "",
      lastName: personalInfo?.lastName || "",
      countryCode: personalInfo?.universityCountryCode || "",
      city: personalInfo?.authId || "",
      email: personalInfo?.userEmail || "",
   }
}
