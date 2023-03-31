import { Filters } from "../../analytics-new/live-stream/users/usePaginatedUsersCollection"
import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { universityCountriesMap } from "../../../../../util/constants/universityCountries"
import { DocumentData, CollectionReference } from "@firebase/firestore"
import { UserDataEntry } from "./UserLivestreamDataTable"

/*
 * An object containing the paths to the fields in the document that we want to query
 * Since this is a generic component, we need to pass in the paths to the original document's fields
 * so that we can sort/filter by them.
 * */
export type DocumentPaths = {
   userEmail: string
   userFieldOfStudyName: string
   userFieldOfStudyId: string
   userLevelOfStudyName: string
   userLevelOfStudyId: string
   userFirstName: string
   userLastName: string
   userUniversityCode: string
   userUniversityName: string
   userUniversityCountryCode: string
   userResume: string
   userLinkedIn: string
   orderBy: string
   orderDirection: "asc" | "desc"
}

type UserLivestreamDataTableContextValue = {
   countriesLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   fieldsOfStudyLookup: Record<string, string>

   filters: Filters
   setFilters: React.Dispatch<React.SetStateAction<Filters>>
   resetFilters: () => void
   documentPaths: DocumentPaths
   targetCollectionQuery: CollectionReference
   /*
    * Function to convert the document from the collection to the normalized format we want to display in the table
    * */
   converterFn: (doc: unknown) => UserDataEntry
}
const UserLivestreamDataTableContext =
   createContext<UserLivestreamDataTableContextValue>({
      countriesLookup: universityCountriesMap,
      levelsOfStudyLookup: {},
      fieldsOfStudyLookup: {},
      filters: {
         selectedLevelOfStudy: null,
         selectedFieldOfStudy: null,
         selectedUniversity: null,
         selectedCountryCodes: [],
      },
      setFilters: () => {},
      resetFilters: () => {},
      documentPaths: {
         userFieldOfStudyName: "",
         userFieldOfStudyId: "",
         userLevelOfStudyName: "",
         userLevelOfStudyId: "",
         userUniversityCode: "",
         userUniversityCountryCode: "",
         userUniversityName: "",
         userFirstName: "",
         userLastName: "",
         orderBy: "",
         orderDirection: "asc",
         userLinkedIn: "",
         userEmail: "",
         userResume: "",
      },
      targetCollectionQuery: null,
      converterFn: () => null,
   })

type Props = {
   fieldsOfStudyLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   documentPaths: DocumentPaths
   targetCollectionQuery: CollectionReference<DocumentData>
   converterFn: (doc: unknown) => UserDataEntry
}

const initialFilters: Filters = {
   selectedFieldOfStudy: null,
   selectedLevelOfStudy: null,
   selectedUniversity: null,
   selectedCountryCodes: [],
}

const UserDataTableProvider: FC<Props> = ({
   children,
   fieldsOfStudyLookup,
   levelsOfStudyLookup,
   documentPaths,
   targetCollectionQuery,
   converterFn,
}) => {
   const [filters, setFilters] = useState<Filters>(initialFilters)

   const resetFilters = useCallback(() => {
      setFilters(initialFilters)
   }, [])

   useEffect(() => {
      // reset filters when livestreamId changes
      resetFilters()
   }, [targetCollectionQuery, resetFilters])

   const value = useMemo<UserLivestreamDataTableContextValue>(
      () => ({
         filters,
         setFilters,
         fieldsOfStudyLookup,
         levelsOfStudyLookup,
         countriesLookup: universityCountriesMap,
         resetFilters,
         documentPaths,
         targetCollectionQuery,
         converterFn,
      }),
      [
         converterFn,
         documentPaths,
         fieldsOfStudyLookup,
         filters,
         levelsOfStudyLookup,
         resetFilters,
         targetCollectionQuery,
      ]
   )
   return (
      <UserLivestreamDataTableContext.Provider value={value}>
         {children}
      </UserLivestreamDataTableContext.Provider>
   )
}

export const useUserDataTable = () => {
   const context = useContext(UserLivestreamDataTableContext)
   if (!context) {
      throw new Error(
         "useUserDataTable must be used within UserLivestreamDataTableContext"
      )
   }
   return context
}

export default UserDataTableProvider
