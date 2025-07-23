import { Box, styled, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"

const Root = styled(Box)({
   position: "absolute",
   width: 110,
   height: 110,
   backgroundColor: "white",
   borderRadius: "5px",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   padding: "10px 3px",
   gap: "3px",
   boxShadow: "0px 0px 35px 0px rgba(20, 20, 20, 0.08)",
})

const NameText = styled(Typography)({
   fontSize: "10px",
   fontWeight: 600,
   textAlign: "center",
   lineHeight: 1.5,
   color: "#000",
})

const SubjectText = styled(Typography)({
   fontSize: "8.397px",
   fontWeight: 300,
   color: "#000",
   textAlign: "center",
   lineHeight: 1.5,
})

type Props = {
   name: string
   subject: string
   imageSrc: string
   position: {
      left?: string
      right?: string
      top: string
      transform?: string
   }
   zIndex: number
}

export const StudentProfileCard = ({
   name,
   subject,
   imageSrc,
   position,
   zIndex,
}: Props) => {
   return (
      <Root sx={{ ...position }} zIndex={zIndex}>
         <CircularLogo src={imageSrc} alt={name} objectFit="cover" size={56} />
         <NameText variant="caption">{name}</NameText>
         <SubjectText variant="caption">{subject}</SubjectText>
      </Root>
   )
}
