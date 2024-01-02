import usePaginatedUsersCollection, {
   Filters,
} from "../../analytics-new/live-stream/users/usePaginatedUsersCollection"
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
import { CollectionReference, Query } from "@firebase/firestore"
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
   /*
    * The title of the table, will be used in the export file names
    * */
   title: string
   /*
    * The noun used to describe the user type, will be used by the table to display messages/labels/buttons
    * Note: The noun should be lowercase and plural
    * */
   userType: string
   filters: Filters
   setFilters: React.Dispatch<React.SetStateAction<Filters>>
   resetFilters: () => void
   rowsPerPage: number
   results: ReturnType<typeof usePaginatedUsersCollection>
   setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
   documentPaths: DocumentPaths
   targetCollectionQuery: CollectionReference | Query
   /*
    * Function to convert the document from the collection to the normalized format we want to display in the table
    * */
   converterFn: (doc: unknown) => UserDataEntry
   /*
    * If true, the table will show a message when there are no results without filters
    */
   noResultsWithoutFilters: boolean
   /*
    * If true, the table will show a message when there are no results with filters
    * */
   noResultsWithFilters: boolean
   /*
    *  Boolean to determine if all filters are inactive
    * */
   filtersInactive: boolean
}
const UserLivestreamDataTableContext =
   createContext<UserLivestreamDataTableContextValue>({
      countriesLookup: universityCountriesMap,
      levelsOfStudyLookup: {},
      title: "",
      userType: "",
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
      results: null,
      rowsPerPage: 10,
      setRowsPerPage: () => {},
      noResultsWithoutFilters: false,
      noResultsWithFilters: false,
      filtersInactive: false,
   })

type Props = {
   fieldsOfStudyLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   documentPaths: DocumentPaths
   targetCollectionQuery: CollectionReference | Query
   converterFn: (doc: unknown) => UserDataEntry
   title: string
   userType: string
   children: React.ReactNode
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
   title,
   userType,
}) => {
   const [filters, setFilters] = useState<Filters>(initialFilters)

   const resetFilters = useCallback(() => {
      setFilters(initialFilters)
   }, [])

   const [rowsPerPage, setRowsPerPage] = useState(10)

   const results = usePaginatedUsersCollection(
      targetCollectionQuery,
      documentPaths,
      rowsPerPage,
      filters
   )

   useEffect(() => {
      // reset filters when livestreamId changes
      resetFilters()
   }, [targetCollectionQuery, resetFilters])

   const filtersInactive = useMemo(
      () =>
         Object.values(filters).every(
            (value) =>
               (Array.isArray(value) && value.length === 0) || value === null
         ),
      [filters]
   )

   const noResultsWithoutFilters = useMemo(
      () =>
         filtersInactive &&
         results.countQueryResponse?.count === 0 &&
         !results.loading,
      [filtersInactive, results.countQueryResponse?.count, results.loading]
   )

   const noResultsWithFilters = useMemo(
      () =>
         !filtersInactive &&
         results.countQueryResponse?.count === 0 &&
         !results.loading,
      [filtersInactive, results.countQueryResponse?.count, results.loading]
   )

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
         title,
         setRowsPerPage,
         rowsPerPage,
         results,
         noResultsWithoutFilters,
         noResultsWithFilters,
         filtersInactive,
         userType,
      }),
      [
         converterFn,
         documentPaths,
         fieldsOfStudyLookup,
         filters,
         filtersInactive,
         levelsOfStudyLookup,
         noResultsWithFilters,
         noResultsWithoutFilters,
         resetFilters,
         results,
         rowsPerPage,
         targetCollectionQuery,
         title,
         userType,
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
