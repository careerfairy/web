// material-ui
import EditGroupIcon from "@mui/icons-material/EditOutlined"
import { Box, Stack, Typography, styled } from "@mui/material"

// project imports
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import HoverOverlay from "components/views/common/HoverOverlay"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useGroup } from "./index"

const RootContainer = styled(Stack)(({ theme }) => ({
   width: "100%",
   padding: theme.spacing(1, 3),
   marginTop: theme.spacing(2),
   marginBottom: theme.spacing(2),
}))

const DetailsContainer = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "flex-start",
   justifyContent: "center",
})

const TruncatedText = styled(Typography)(getMaxLineStyles(1))

const HoverIcon = styled(EditGroupIcon)({
   color: "white",
})

const EditGroupCard = () => {
   const { group } = useGroup()

   const companyName = group?.universityName

   return (
      <RootContainer spacing={0.5}>
         <CircularLogo
            src={group?.logoUrl}
            alt={`logo of company ${companyName}`}
            size={80}
         >
            <HoverOverlay
               href={`/group/${group.id}/admin/edit`}
               icon={<HoverIcon fontSize="large" />}
            />
         </CircularLogo>
         <DetailsContainer>
            <Typography
               fontWeight={400}
               variant={"xsmall"}
               color={"neutral.400"}
            >
               {"Dashboard"}
            </Typography>
            <TruncatedText
               fontWeight={400}
               variant={"medium"}
               color="neutral.900"
            >
               {companyName}
            </TruncatedText>
         </DetailsContainer>
      </RootContainer>
   )
}

export default EditGroupCard
