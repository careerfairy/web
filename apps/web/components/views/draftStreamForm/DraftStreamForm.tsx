import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { Group } from "@careerfairy/shared-lib/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { v4 as uuidv4 } from "uuid"
import { languageCodes } from "../../helperFunctions/streamFormFunctions"

export type ISpeakerObj = {
   avatar: string
   firstName: string
   lastName: string
   position: string
   background: string
   email: string
}

export const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
   email: "",
} as ISpeakerObj

export const getLivestreamInitialValues = (group: Group) => ({
   // add group logo if it has any and if it's not a university
   companyLogoUrl: group?.universityCode ? "" : group?.logoUrl || "",
   backgroundImageUrl: group?.universityCode ? "" : group?.bannerImageUrl || "",
   // add group name if it has any and if it's not a university
   company: group?.universityCode ? "" : group?.universityName || "",
   companyId: "",
   title: "",
   groupIds: [],
   start: new Date(),
   groupQuestionsMap: {},
   duration: 60,
   hidden: false,
   summary: "",
   reasonsToJoinLivestream: "",
   reasonsToJoinLivestream_v2: [],
   speakers: { [uuidv4()]: speakerObj },
   creatorsIds: [],
   contentTopicsTagIds: [],
   businessFunctionsTagIds: [],
   status: {},
   language: languageCodes[0],
   targetFieldsOfStudy: [],
   targetLevelsOfStudy: [],
   promotionChannelsCodes: [],
   promotionCountriesCodes: [],
   promotionUniversitiesCodes: [],
   questionsDisabled: false,
})

export interface DraftFormValues {
   id?: string
   companyLogoUrl: string
   backgroundImageUrl: string
   company: string
   companyId: string
   title: string
   groupIds: string[]
   start: Date
   groupQuestionsMap: LivestreamGroupQuestionsMap
   duration: number
   hidden: boolean
   summary: string
   reasonsToJoinLivestream: string
   reasonsToJoinLivestream_v2: string[]
   speakers: Record<string, Partial<Speaker>>
   creatorsIds: LivestreamEvent["creatorsIds"]
   status: object
   language: {
      code: string
      name: string
      shortName: string
   }
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: FieldOfStudy[]
   contentTopicsTagIds: OptionGroup[]
   businessFunctionsTagIds: OptionGroup[]
   promotionChannelsCodes: OptionGroup[]
   promotionCountriesCodes: OptionGroup[]
   promotionUniversitiesCodes: OptionGroup[]
   questionsDisabled: boolean
}
