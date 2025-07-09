import { Box, Stack, styled } from "@mui/material"
import Image from "next/image"
import { ThumbsUp } from "react-feather"

const Container = styled(Box)({
   backgroundColor: "#FBF5E6",
   borderRadius: "4px",
   height: "158px",
   position: "relative",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   overflow: "hidden",
})

const PhoneMockup = styled(Box)({
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
})

const StyledImage = styled(Image)({
   borderRadius: "9px",
})

const AvatarCircle = styled(Box)({
   position: "absolute",
   top: "5px",
   left: "5px",
   width: "24px",
   height: "24px",
   borderRadius: "50%",
   backgroundColor: "rgba(243, 243, 245, 0.92)",
   backdropFilter: "blur(23px)",
})

const TextLine1 = styled(Box)({
   position: "absolute",
   top: "8px",
   left: "32px",
   width: "46px",
   height: "8px",
   borderRadius: "2px",
   backgroundColor: "rgba(243, 243, 245, 0.92)",
   backdropFilter: "blur(23px)",
})

const TextLine2 = styled(Box)({
   position: "absolute",
   top: "17px",
   left: "32px",
   width: "30px",
   height: "8px",
   borderRadius: "2px",
   backgroundColor: "rgba(243, 243, 245, 0.92)",
   backdropFilter: "blur(23px)",
})

const IconStack = styled(Stack)({
   position: "absolute",
   right: -11,
   bottom: 45,
   alignItems: "center",
})

export const EngagementMockup = () => {
   return (
      <Container>
         <PhoneMockup>
            <StyledImage
               src="/mockup/engagement.jpg"
               alt="Avatar"
               fill
               sizes="136px"
               style={{ objectFit: "cover" }}
               quality={100}
            />
            <AvatarCircle />
            <TextLine1 />
            <TextLine2 />
            <IconStack spacing={1}>
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
            </IconStack>
         </PhoneMockup>
      </Container>
   )
}
