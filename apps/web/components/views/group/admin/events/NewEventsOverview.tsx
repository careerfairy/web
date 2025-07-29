import { MenuItem } from "@mui/material"
import { useRouter } from "next/router"
import { Fragment, useState } from "react"
import {
   LivestreamStatsSortOption,
   useGroupLivestreamsWithStats,
} from "../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { BrandedSearchField } from "../../../common/inputs/BrandedSearchField"
import BrandedTextField from "../../../common/inputs/BrandedTextField"
import { DesktopEventsView } from "./DesktopEventsView"
import { MobileEventsView } from "./MobileEventsView"

const SORT_OPTIONS: { value: LivestreamStatsSortOption; label: string }[] = [
   { value: LivestreamStatsSortOption.START_DESC, label: "Most Recent First" },
   { value: LivestreamStatsSortOption.START_ASC, label: "Oldest First" },
   { value: LivestreamStatsSortOption.TITLE_ASC, label: "Title A-Z" },
   { value: LivestreamStatsSortOption.TITLE_DESC, label: "Title Z-A" },
   {
      value: LivestreamStatsSortOption.REGISTRATIONS_DESC,
      label: "Most Registrations",
   },
   {
      value: LivestreamStatsSortOption.REGISTRATIONS_ASC,
      label: "Least Registrations",
   },
   {
      value: LivestreamStatsSortOption.PARTICIPANTS_DESC,
      label: "Most Participants",
   },
   {
      value: LivestreamStatsSortOption.PARTICIPANTS_ASC,
      label: "Least Participants",
   },
]

export const NewEventsOverview = () => {
   const router = useRouter()
   const groupId = router.query.groupId as string
   const [searchTerm, setSearchTerm] = useState("")
   const [sortBy, setSortBy] = useState<LivestreamStatsSortOption>(
      LivestreamStatsSortOption.START_DESC
   )
   const isMobile = useIsMobile()

   const {
      data: stats,
      isLoading,
      error,
   } = useGroupLivestreamsWithStats(groupId, {
      sortBy,
      searchTerm,
   })

   return (
      <div style={{ padding: isMobile ? "15px" : "20px" }}>
         <h1 style={{ fontSize: isMobile ? "20px" : "24px" }}>
            New Events Table (Feature Flag Enabled)
         </h1>

         <div
            style={{
               marginBottom: "20px",
               display: "flex",
               flexDirection: isMobile ? "column" : "row",
               gap: isMobile ? "15px" : "20px",
               alignItems: isMobile ? "stretch" : "center",
            }}
         >
            <BrandedSearchField
               value={searchTerm}
               onChange={setSearchTerm}
               placeholder="Enter search term..."
               fullWidth
            />

            <BrandedTextField
               label="Sort by"
               select
               value={sortBy}
               onChange={(e) =>
                  setSortBy(
                     e.target.value as unknown as LivestreamStatsSortOption
                  )
               }
               fullWidth={isMobile}
               sx={{
                  minWidth: isMobile ? "100%" : "200px",
               }}
            >
               {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                     {option.label}
                  </MenuItem>
               ))}
            </BrandedTextField>
         </div>

         {Boolean(isLoading) && <p>Loading stats...</p>}
         {Boolean(error) && <p>Error loading stats: {error.message}</p>}

         {stats.length > 0 ? (
            <Fragment>
               {isMobile ? (
                  <MobileEventsView stats={stats} />
               ) : (
                  <DesktopEventsView stats={stats} />
               )}
            </Fragment>
         ) : (
            <p>No events found matching your search criteria.</p>
         )}
      </div>
   )
}
