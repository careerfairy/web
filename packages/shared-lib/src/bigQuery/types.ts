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
   countriesOfInterest: string
   universityCode: string
   universityName: string
   linkedinUrl: string
   totalHits: number
   lastActivityAt: {
      value: string
   }
}

export interface BigQueryUserQueryOptions {
   filters?: GetUserFilters
   page: number
   orderBy: keyof BigQueryUserResponse
   sortOrder: "DESC" | "ASC"
   limit: number
}
export interface GetUserFilters {
   universityCountryCodes?: string[]
   universityName?: string
   universityCodes?: string[]
   fieldOfStudyIds?: string[]
   levelOfStudyIds?: string[]
   countriesOfInterest?: string[]
}
