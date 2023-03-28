import { Filters } from "../../analytics-new/live-stream/users/usePaginatedLivestreamUsers"
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
import { LivestreamUserAction } from "@careerfairy/shared-lib/livestreams"

type UserLivestreamDataTableContextValue = {
   countriesLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   fieldsOfStudyLookup: Record<string, string>

   filters: Filters
   setFilters: React.Dispatch<React.SetStateAction<Filters>>
   resetFilters: () => void
   livestreamId: string
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
         userType: "registered",
      },
      setFilters: () => {},
      resetFilters: () => {},
      livestreamId: "",
   })

type Props = {
   fieldsOfStudyLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   livestreamId: string
   userType: LivestreamUserAction
}

const initialFilters: Filters = {
   selectedFieldOfStudy: null,
   selectedLevelOfStudy: null,
   selectedUniversity: null,
   selectedCountryCodes: [],
   userType: "registered",
}

const getInitialFilters = (userType: Filters["userType"]): Filters => ({
   ...initialFilters,
   userType,
})
const UserLivestreamDataTableProvider: FC<Props> = ({
   children,
   livestreamId,
   fieldsOfStudyLookup,
   levelsOfStudyLookup,
   userType,
}) => {
   const [filters, setFilters] = useState<Filters>(getInitialFilters(userType))

   const resetFilters = useCallback(() => {
      setFilters(getInitialFilters(userType))
   }, [userType])

   useEffect(() => {
      // reset filters when livestreamId changes
      resetFilters()
   }, [livestreamId, resetFilters])

   const value = useMemo<UserLivestreamDataTableContextValue>(
      () => ({
         filters,
         setFilters,
         fieldsOfStudyLookup,
         levelsOfStudyLookup,
         countriesLookup: universityCountriesMap,
         resetFilters,
         livestreamId,
      }),
      [
         fieldsOfStudyLookup,
         filters,
         levelsOfStudyLookup,
         livestreamId,
         resetFilters,
      ]
   )
   return (
      <UserLivestreamDataTableContext.Provider value={value}>
         {children}
      </UserLivestreamDataTableContext.Provider>
   )
}

export const useUserLivestreamDataTableContext = () => {
   const context = useContext(UserLivestreamDataTableContext)
   if (!context) {
      throw new Error(
         "useUserLivestreamDataTableContext must be used within UserLivestreamDataTableContext"
      )
   }
   return context
}

export default UserLivestreamDataTableProvider
