export interface BigQueryUserResponse {
   firstName: string
   lastName: string
   userEmail: string
   id: string
   unsubscribed: boolean
   fieldOfStudyName: string
   fieldOfStudyId: string
   levelOfStudyName: string
   levelOfStudyId: string
   universityCountryCode: string
   universityCode: string
   universityName: string
   linkedinUrl: string
   totalHits: number
}

export interface BigQueryUserQueryOptions {
   universityCountryCodes: string[]
   universityName: ""
   fieldOfStudyIds: string[]
   levelOfStudyIds: string[]
   page: number
   orderBy: keyof BigQueryUserResponse
   sortOrder: "DESC" | "ASC"
   limit: number
}
