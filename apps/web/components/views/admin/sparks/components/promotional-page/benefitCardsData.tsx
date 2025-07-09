import { Box } from "@mui/material"
import { AnalyticsMockup } from "./AnalyticsMockup"
import { EngagementMockup } from "./EngagementMockup"
import { StudentMockup } from "./StudentMockup"

export const benefitCardsData = [
   {
      id: "students",
      mockupContent: <StudentMockup />,
      title: "Get in front of the right students",
      description:
         "Target by study field, degree level, and more to engage students and build your pipeline",
   },
   {
      id: "engagement",
      mockupContent: <EngagementMockup />,
      title: "Easy to make, hard to ignore",
      description:
         "Quick to create, no big production needed. Authentic videos that perform best with Gen Z",
   },
   {
      id: "analytics",
      mockupContent: <AnalyticsMockup />,
      title: "Understand what&apos;s working",
      description:
         "Track views, likes and shares in real time to double down on what students actually care about",
   },
   {
      id: "livestreams",
      mockupContent: (
         <Box
            sx={{
               backgroundColor: "#F3EDFD",
               borderRadius: "4px",
               height: "158px",
               position: "relative",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
         >
            <Box
               sx={{
                  width: "140px",
                  height: "100px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "2px solid white",
                  position: "relative",
               }}
            >
               <Box
                  sx={{
                     position: "absolute",
                     top: "8px",
                     right: "8px",
                     backgroundColor: "#856DEE",
                     borderRadius: "12px",
                     padding: "2px 4px",
                     border: "1px solid #EFE9F9",
                  }}
               >
                  <Box display="flex" flexDirection="column" gap="1px">
                     <Box
                        sx={{
                           width: "4px",
                           height: "2px",
                           backgroundColor: "white",
                        }}
                     />
                     <Box
                        sx={{
                           width: "4px",
                           height: "2px",
                           backgroundColor: "rgba(255,255,255,0.5)",
                        }}
                     />
                     <Box
                        sx={{
                           width: "4px",
                           height: "2px",
                           backgroundColor: "rgba(255,255,255,0.2)",
                        }}
                     />
                  </Box>
               </Box>
               <Box
                  sx={{
                     position: "absolute",
                     bottom: "8px",
                     left: "8px",
                     right: "8px",
                     height: "12px",
                     backgroundColor: "rgba(253, 252, 255, 0.78)",
                     backdropFilter: "blur(16px)",
                     borderRadius: "4px",
                  }}
               />
            </Box>
         </Box>
      ),
      title: "Get more out of your Live Streams",
      description:
         "Use Sparks to warm up student interest early, so more of them join your events and apply afterward",
   },
]
