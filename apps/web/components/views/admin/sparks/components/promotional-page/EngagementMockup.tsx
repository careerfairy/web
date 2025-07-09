import { Box, Stack } from "@mui/material"
import Image from "next/image"
import { ThumbsUp } from "react-feather"

export const EngagementMockup = () => {
   return (
      <Box
         sx={{
            backgroundColor: "#FBF5E6",
            borderRadius: "4px",
            height: "158px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
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
               boxShadow: "0px 0px 26px 0px rgba(255, 182, 0, 0.25)",
               position: "absolute",
               transform: "translate(-50%, -50%)",
               top: 108,
               left: "50%",
               //    overflow: "hidden",
            }}
         >
            {/* Avatar circle */}
            <Box
               component={Image}
               src="/student-avatars/engagement.jpg"
               alt="Avatar"
               style={{
                  objectFit: "cover",
                  borderRadius: "9px",
               }}
               layout="fill"
               quality={100}
            />
            {/* Text lines */}
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
            {/* Thumbs up icons stacked vertically */}
            <Stack
               spacing={1}
               position="absolute"
               right={-11}
               bottom={45}
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
      </Box>
   )
}
