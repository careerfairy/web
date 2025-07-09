import { Fragment } from "react"
import SEO from "../../../components/util/SEO"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"

import { SearchProvider } from "components/views/search/SearchContext"
import SearchField from "components/views/search/SearchField"
import SearchResults from "components/views/search/SearchResults"

const SearchPage = () => {
   return (
      <Fragment>
         <SEO
            id={"CareerFairy | Search"}
            title={"CareerFairy | Search"}
            noIndex={true}
            description="Internal search page - not for public indexing"
            additionalMetaTags={[
               {
                  name: "robots",
                  content: "noindex, nofollow, noarchive, nosnippet",
               },
            ]}
         />
         <GenericDashboardLayout
            pageDisplayName={""}
            headerType="sticky"
            blurHeaderOnScroll
            headerScrollThreshold={20}
         >
            <SearchProvider>
               <SearchField />
               <SearchResults />
            </SearchProvider>
         </GenericDashboardLayout>
      </Fragment>
   )
}

export default SearchPage
