import BrandedSearchField from "components/views/common/inputs/BrandedSearchBar"

import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTerm = () => {
   const { searchTerm, setSearchTerm } = useJobsOverviewContext()

   return (
      <BrandedSearchField
         value={searchTerm}
         onChange={setSearchTerm}
         placeholder="Search jobs or companies"
      />
   )
}
