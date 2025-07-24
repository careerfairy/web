import { useRouter } from "next/router"
import { Fragment, useState } from "react"
import {
   LivestreamStatsSortOption,
   useGroupLivestreamsWithStats,
} from "../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import useIsMobile from "../../../../custom-hook/useIsMobile"
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
            <div
               style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
               <label
                  htmlFor="search"
                  style={{ fontSize: isMobile ? "14px" : "16px" }}
               >
                  Search by title or company:
               </label>
               <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter search term..."
                  style={{
                     padding: "8px",
                     width: isMobile ? "100%" : "300px",
                     fontSize: "14px",
                  }}
               />
            </div>

            <div
               style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
               <label
                  htmlFor="sort"
                  style={{ fontSize: isMobile ? "14px" : "16px" }}
               >
                  Sort by:
               </label>
               <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) =>
                     setSortBy(e.target.value as LivestreamStatsSortOption)
                  }
                  style={{
                     padding: "8px",
                     width: isMobile ? "100%" : "auto",
                     fontSize: "14px",
                  }}
               >
                  {SORT_OPTIONS.map((option) => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {Boolean(isLoading) && <p>Loading stats...</p>}
         {Boolean(error) && <p>Error loading stats: {error.message}</p>}

         {Boolean(stats) && (
            <Fragment>
               {isMobile ? (
                  <MobileEventsView stats={stats} />
               ) : (
                  <DesktopEventsView stats={stats} />
               )}
            </Fragment>
         )}
      </div>
   )
}
