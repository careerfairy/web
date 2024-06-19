import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"

export type BasicInfoValues = {
   title: string
   jobType?: string
   businessTags: OptionGroup[]
}

export type AdditionalInfoValues = {
   salary?: string
   description: string
   deadline: Date
   postingUrl: string
   noDateValidation: boolean
}

export type JobFormValues = {
   id: string
   groupId: string
   basicInfo: BasicInfoValues
   additionalInfo: AdditionalInfoValues
}
