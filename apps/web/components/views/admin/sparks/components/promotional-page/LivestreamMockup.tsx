import { Box, styled } from "@mui/material"
import Image from "next/image"

const Container = styled(Box)({
   backgroundColor: "#F3EDFD",
   borderRadius: "4px",
   height: "158px",
   position: "relative",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   overflow: "hidden",
})

export const LivestreamMockup = () => {
   return (
      <Container>
         <Image
            src="/mockup/livestream.png"
            alt="Livestream"
            layout="fill"
            objectFit="cover"
            quality={100}
         />
      </Container>
   )
}
