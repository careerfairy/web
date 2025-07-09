import { Box, Stack, Typography } from "@mui/material"
import { Eye, ThumbsUp } from "react-feather"
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
      mockupContent: (
         <Box
            sx={{
               backgroundColor: "#FBF5E6",
               borderRadius: "4px",
               height: "158px",
               position: "relative",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
         >
            {/* Phone mockup */}
            <Box
               sx={{
                  width: "136px",
                  height: "185px",
                  backgroundColor: "rgba(243, 243, 245, 0.92)",
                  backdropFilter: "blur(23px)",
                  borderRadius: "9px",
                  position: "relative",
                  boxShadow: "0px 0px 26px 0px rgba(255, 182, 0, 0.25)",
               }}
            >
               {/* Avatar circle */}
               <Box
                  sx={{
                     position: "absolute",
                     top: "5px",
                     left: "5px",
                     width: "24px",
                     height: "24px",
                     borderRadius: "50%",
                     backgroundColor: "rgba(243, 243, 245, 0.92)",
                     backdropFilter: "blur(23px)",
                  }}
               />
               {/* Text lines */}
               <Box
                  sx={{
                     position: "absolute",
                     top: "8px",
                     left: "32px",
                     width: "46px",
                     height: "8px",
                     borderRadius: "2px",
                     backgroundColor: "rgba(243, 243, 245, 0.92)",
                     backdropFilter: "blur(23px)",
                  }}
               />
               <Box
                  sx={{
                     position: "absolute",
                     top: "17px",
                     left: "32px",
                     width: "30px",
                     height: "8px",
                     borderRadius: "2px",
                     backgroundColor: "rgba(243, 243, 245, 0.92)",
                     backdropFilter: "blur(23px)",
                  }}
               />
            </Box>
            {/* Thumbs up icons stacked vertically */}
            <Stack
               spacing={1}
               position="absolute"
               right={63}
               bottom={0}
               alignItems="center"
            >
               <ThumbsUp
                  size={12}
                  fill="#FE9B0E"
                  stroke="#FBF5E6"
                  strokeWidth={1}
                  style={{ transform: "rotate(3.075deg)" }}
               />
               <ThumbsUp
                  size={16}
                  fill="#FE9B0E"
                  stroke="#FBF5E6"
                  strokeWidth={1}
                  style={{ transform: "rotate(-7.496deg)" }}
               />
               <ThumbsUp
                  size={20}
                  fill="#FE9B0E"
                  stroke="#FBF5E6"
                  strokeWidth={1}
                  style={{ transform: "rotate(14.115deg)" }}
               />
               <ThumbsUp
                  size={24}
                  fill="#FE9B0E"
                  stroke="#FBF5E6"
                  strokeWidth={1}
                  style={{ transform: "rotate(-5.86deg)" }}
               />
            </Stack>
         </Box>
      ),
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
