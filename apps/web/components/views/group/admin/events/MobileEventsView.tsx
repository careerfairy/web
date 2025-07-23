import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, CircularProgress } from "@mui/material"
import { Fragment } from "react"
import useClientSideInfiniteScroll from "../../../../custom-hook/utils/useClientSideInfiniteScroll"

type Props = {
   stats: LiveStreamStats[]
}

export const MobileEventsView = ({ stats }: Props) => {
   const { visibleData, hasMore, isLoading, ref } = useClientSideInfiniteScroll(
      {
         data: stats,
         itemsPerPage: 5,
      }
   )

   return (
      <Fragment>
         <div>
            <p
               style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}
            >
               Showing {visibleData.length} of {stats.length} events
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
               {visibleData.map((stat) => (
                  <li
                     key={stat.id}
                     style={{
                        marginBottom: "12px",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: stat.livestream.isDraft
                           ? "#fff3cd"
                           : "#f8f9fa",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                     }}
                  >
                     <div
                        style={{
                           fontWeight: "bold",
                           fontSize: "16px",
                           marginBottom: "6px",
                           lineHeight: "1.3",
                        }}
                     >
                        {stat.livestream.title || "Untitled"}
                     </div>

                     <div
                        style={{
                           color: "#666",
                           fontSize: "13px",
                           marginBottom: "8px",
                        }}
                     >
                        {stat.livestream.company || "No company"}
                        {Boolean(stat.livestream.isDraft) && (
                           <span
                              style={{
                                 color: "#856404",
                                 fontWeight: "bold",
                                 marginLeft: "8px",
                                 padding: "1px 6px",
                                 backgroundColor: "#ffeaa7",
                                 borderRadius: "3px",
                                 fontSize: "11px",
                              }}
                           >
                              DRAFT
                           </span>
                        )}
                     </div>

                     <div
                        style={{
                           fontSize: "12px",
                           display: "flex",
                           flexDirection: "column",
                           gap: "4px",
                        }}
                     >
                        <div
                           style={{
                              display: "flex",
                              gap: "12px",
                              flexWrap: "wrap",
                           }}
                        >
                           <span>
                              <strong>Reg:</strong>{" "}
                              {stat.generalStats.numberOfRegistrations}
                           </span>
                           <span>
                              <strong>Part:</strong>{" "}
                              {stat.generalStats.numberOfParticipants}
                           </span>
                           <span>
                              <strong>Views:</strong> (not implemented)
                           </span>
                        </div>
                        <span style={{ color: "#888" }}>
                           <strong>Start:</strong>{" "}
                           {stat.livestream.start
                              ?.toDate?.()
                              ?.toLocaleDateString() || "No date"}
                        </span>
                     </div>
                  </li>
               ))}
            </ul>

            {Boolean(isLoading) && (
               <Box
                  sx={{
                     display: "flex",
                     justifyContent: "center",
                     py: 2,
                  }}
               >
                  <CircularProgress size={24} />
               </Box>
            )}

            {Boolean(hasMore) && <Box height={100} ref={ref} />}

            {!hasMore && visibleData.length > 0 && (
               <p
                  style={{
                     textAlign: "center",
                     color: "#666",
                     fontSize: "14px",
                     marginTop: "20px",
                     fontStyle: "italic",
                  }}
               >
                  All events loaded
               </p>
            )}
         </div>
      </Fragment>
   )
}
