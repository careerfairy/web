import React, { createContext, useContext, useMemo } from "react"
import { useRouter } from "next/router"
import FilterSelector from "./FilterSelector"

export enum FilterEnum {
   SORT_BY = "sortBy",
   LANGUAGES = "languages",
   INTERESTS = "interests",
   JOB_CHECK = "jobCheck",
   SEARCH = "search",
   FIELDS_OF_STUDY = "fieldsOfStudy",
   COMPANY_COUNTRIES = "companyCountries",
   COMPANY_SIZES = "companySizes",
   COMPANY_INDUSTRIES = "companyIndustries",
   COMPANY_SPARKS = "companySparks",
   /**
    * If this filter is active, it means we are filtering by company
    * */
   COMPANY_ID = "companyId",
   RECORDED_ONLY = "recordedOnly",
}

type FilterContextType = {
   numberOfActiveFilters: number
   filtersToShow: FilterEnum[]
   numberOfResults: number
}

const FilterContext = createContext<FilterContextType>({
   numberOfActiveFilters: 0,
   filtersToShow: [],
   numberOfResults: 0,
})

type Props = {
   filtersToShow: FilterEnum[]
   numberOfResults?: number
}

const Filter = ({ filtersToShow, numberOfResults }: Props) => {
   const { query } = useRouter()

   const numberOfActiveFilters = useMemo(
      () =>
         [
            query.interests,
            query.sortBy,
            query.languages,
            query.jobCheck,
            query.companyCountries,
            query.companySizes,
            query.companyIndustries,
            query.companySparks === "true" ? query.companySparks : null,
            query.recordedOnly === "true" ? query.recordedOnly : null,
            query.fieldsOfStudy,
            query.companyId,
         ].filter((value) => value).length,
      [query]
   )

   const value = useMemo<FilterContextType>(
      () => ({
         numberOfActiveFilters,
         filtersToShow,
         numberOfResults,
      }),
      [filtersToShow, numberOfActiveFilters, numberOfResults]
   )

   return (
      <FilterContext.Provider value={value}>
         <FilterSelector />
      </FilterContext.Provider>
   )
}

export const useFilter = () => {
   const context = useContext(FilterContext)
   if (context === undefined) {
      throw new Error("useFilter must be used within a FilterContextProvider")
   }
   return context
}
export default Filter
