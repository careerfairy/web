import BrandedSearchBar from "components/views/common/inputs/BrandedSearchBar"

import { useJobsOverviewContext } from "components/views/jobs-page/JobsOverviewContext"

export const SearchByTerm = () => {
   const { searchTerm, setSearchTerm } = useJobsOverviewContext()

   return (
      <BrandedSearchBar
         value={searchTerm}
         onChange={setSearchTerm}
         placeholder="Search jobs or companies"
      />
   )
}
