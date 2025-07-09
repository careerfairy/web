import { Box, Typography } from "@mui/material"
import { Eye } from "react-feather"
import { StudentMockup } from "./StudentMockup"
import { EngagementMockup } from "./EngagementMockup"

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
      mockupContent: (
         <Box
            sx={{
               backgroundColor: "#E6FBED",
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
                  backgroundColor: "white",
                  borderRadius: "50px",
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  border: "1px solid #00D247",
                  boxShadow: "0px 0px 60px 9px rgba(17, 226, 87, 0.22)",
               }}
            >
               <Eye size={24} color="#3D3D47" />
               <Typography variant="h6" color="#3D3D47">
                  1.328
               </Typography>
            </Box>
            <Box
               sx={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: "#00D247",
                  borderRadius: "16px",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
               }}
            >
               <Typography variant="caption" color="white" fontWeight={400}>
                  +75%
               </Typography>
            </Box>
         </Box>
      ),
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
