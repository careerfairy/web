import { Box, Typography, styled } from "@mui/material"
import Image from "next/image"
import { Eye } from "react-feather"

const Container = styled(Box)({
   backgroundColor: "#E6FBED",
   borderRadius: "4px",
   height: "158px",
   position: "relative",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
})

const AnalyticsPill = styled(Box)(({ theme }) => ({
   backgroundColor: theme.brand.white[100],
   borderRadius: "50px",
   padding: "9.6px 19.2px",
   display: "flex",
   alignItems: "center",
   gap: "9.6px",
   border: `1.2px solid ${theme.palette.success.main}`,
   boxShadow: "0px 0px 60px 9px rgba(17, 226, 87, 0.22)",
}))

const AnalyticsText = styled(Typography)(({ theme }) => ({
   color: theme.palette.neutral[800],
   fontWeight: 400,
   fontSize: "19.2px !important",
   lineHeight: 1.5,
}))

const PercentageBadge = styled(Box)(({ theme }) => ({
   position: "absolute",
   top: "35%",
   transform: "translateY(-50%)",
   right: "calc(50% - 65.769px)",
   backgroundColor: theme.palette.success.main,
   borderRadius: "32px",
   padding: "2.9px 5.8px",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   gap: "2.9px",
   height: "20.79px",
}))

const Arrow = styled(Box)({
   width: 0,
   height: 0,
   borderLeft: "3px solid transparent",
   borderRight: "3px solid transparent",
   borderBottom: "5px solid white",
   marginRight: "2px",
})

const PercentageText = styled(Typography)(({ theme }) => ({
   color: theme.brand.white[100],
   fontSize: "10.125px",
   lineHeight: 1.5,
}))

const ImageElement = styled(Box)({
   position: "absolute",
   transform: "translateY(50%)",
   right: "calc(50% - 71.769px)",
   top: "34%",
   "& img": {
      transform: "rotate(-4.909deg)",
   },
})

export const AnalyticsMockup = () => {
   return (
      <Container>
         {/* Main analytics pill */}
         <AnalyticsPill>
            <Eye size={24} color="#3D3D47" />
            <AnalyticsText variant="h6">1.328</AnalyticsText>
         </AnalyticsPill>

         {/* Green percentage badge */}
         <PercentageBadge>
            {/* Small arrow/triangle pointing up */}
            <Arrow />
            <PercentageText variant="caption">+75%</PercentageText>
         </PercentageBadge>

         {/* Image element at bottom right */}
         <ImageElement>
            <Image
               width={39.538}
               height={42.004}
               src="/student-avatars/hand.png"
               alt="Analytics"
            />
         </ImageElement>
      </Container>
   )
}
