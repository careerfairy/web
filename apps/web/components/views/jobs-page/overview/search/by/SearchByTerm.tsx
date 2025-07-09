import BrandedSearchField from "components/views/common/inputs/BrandedSearchBar"
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

   return (
      <BrandedSearchField
         value={localSearchTerm}
         onChange={setLocalSearchTerm}
         placeholder="Search jobs or companies"
         settings={{
            submitOnEnter: true,
            submitOnBlur: isMobile,
            onSubmit: handleSubmit,
         }}
      />
   )
}
