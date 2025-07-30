import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Stack } from "@mui/material"
import useClientSidePagination from "../../../../custom-hook/utils/useClientSidePagination"
import { StyledPagination } from "../common/CardCustom"
import { getEventStatsKey } from "./util"

type Props = {
   stats: LiveStreamStats[]
}

export const DesktopEventsView = ({ stats }: Props) => {
   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: 10,
      })

   return (
      <div>
         <p>
            Showing {(currentPage - 1) * 10 + 1}-
            {Math.min(currentPage * 10, stats.length)} of {stats.length}{" "}
            livestream stats
         </p>

         <ul style={{ listStyle: "none", padding: 0 }}>
            {currentPageData.map((stat, index) => {
               const globalIndex = (currentPage - 1) * 10 + index + 1
               return (
                  <li
                     key={getEventStatsKey(stat)}
                     style={{
                        marginBottom: "10px",
                        padding: "15px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: stat.livestream.isDraft
                           ? "#fff3cd"
                           : "#f8f9fa",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                     }}
                  >
                     <div
                        style={{
                           fontWeight: "bold",
                           fontSize: "18px",
                           marginBottom: "8px",
                        }}
                     >
                        #{globalIndex} - {stat.livestream.title || "Untitled"}
                     </div>
                     <div
                        style={{
                           color: "#666",
                           fontSize: "14px",
                           marginBottom: "8px",
                        }}
                     >
                        <strong>Company:</strong>{" "}
                        {stat.livestream.company || "No company"}
                        {Boolean(stat.livestream.isDraft) && (
                           <span
                              style={{
                                 color: "#856404",
                                 fontWeight: "bold",
                                 marginLeft: "10px",
                                 padding: "2px 8px",
                                 backgroundColor: "#ffeaa7",
                                 borderRadius: "4px",
                                 fontSize: "12px",
                              }}
                           >
                              DRAFT
                           </span>
                        )}
                     </div>
                     <div
                        style={{
                           fontSize: "13px",
                           display: "flex",
                           gap: "15px",
                           flexWrap: "wrap",
                        }}
                     >
                        <span>
                           <strong>Registrations:</strong>{" "}
                           {stat.generalStats.numberOfRegistrations}
                        </span>
                        <span>
                           <strong>Participants:</strong>{" "}
                           {stat.generalStats.numberOfParticipants}
                        </span>
                        <span>
                           <strong>Views:</strong> (not implemented)
                        </span>
                        <span>
                           <strong>Start:</strong>{" "}
                           {stat.livestream.start
                              ?.toDate?.()
                              ?.toLocaleDateString() || "No date"}
                        </span>
                     </div>
                  </li>
               )
            })}
         </ul>

         {totalPages > 1 && (
            <Stack
               direction="row"
               justifyContent="flex-end"
               alignItems="center"
               spacing={2}
               mt={2}
            >
               <StyledPagination
                  color="secondary"
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => goToPage(page)}
               />
            </Stack>
         )}
      </div>
   )
}
