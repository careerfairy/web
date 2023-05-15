import React, { createContext, useContext, useMemo } from "react"
import { useRouter } from "next/router"
import FilterSelector from "./FilterSelector"

export enum FilterEnum {
   sortBy = "sortBy",
   languages = "languages",
   interests = "interests",
   jobCheck = "jobCheck",
   search = "search",
   companyCountries = "companyCountries",
   companySizes = "companySizes",
   companyIndustries = "companyIndustries",
   recordedOnly = "recordedOnly",
}

type IFilterContext = {
   numberOfActiveFilters: number
   filtersToShow: FilterEnum[]
   numberOfResults: number
}

const FilterContext = createContext<IFilterContext>({
   numberOfActiveFilters: 0,
   filtersToShow: [],
   numberOfResults: 0,
})

type Props = {
   filtersToShow: FilterEnum[]
   numberOfResults: number
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
            query.recordedOnly,
         ].filter((value) => value).length,
      [query]
   )

   const value = useMemo<IFilterContext>(
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
