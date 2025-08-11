import { BrandedSearchField } from "components/views/common/inputs/BrandedSearchField"
import { useState } from "react"

import useIsMobile from "components/custom-hook/useIsMobile"
import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTerm = () => {
   const isMobile = useIsMobile()
   const { searchTerm, setSearchTerm } = useJobsOverviewContext()
   const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

   const handleSubmit = (value: string) => {
      setSearchTerm(value)
   }

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
         handleSubmit(localSearchTerm)
      }
   }

   const handleBlur = () => {
      if (isMobile) {
         handleSubmit(localSearchTerm)
      }
   }

   return (
      <BrandedSearchField
         value={localSearchTerm}
         onChange={setLocalSearchTerm}
         placeholder="Search jobs or companies"
         onKeyDown={handleKeyDown}
         onBlur={handleBlur}
      />
   )
}
