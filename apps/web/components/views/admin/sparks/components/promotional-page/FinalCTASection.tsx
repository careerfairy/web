import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { LoadingButton } from "@mui/lab"
import { styled, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useStartPlanMutation } from "components/custom-hook/group/useStartPlanMutation"
import { useGroup } from "layouts/GroupDashboardLayout"

export const StyledCTATitle = styled(Typography)(({ theme }) => ({
   fontSize: 40,
   fontWeight: 800,
   color: theme.palette.neutral[800],
   letterSpacing: "-2px",
   textAlign: "center",
   [theme.breakpoints.down("md")]: {
      fontSize: 28,
      letterSpacing: "-1.4px",
      lineHeight: 1.09,
      padding: "0 32px",
   },
}))

export const StyledFinalCTA = styled(Box)(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "12px",
   width: "100%",
   maxWidth: "904px",
   [theme.breakpoints.down("md")]: {
      maxWidth: "none",
   },
}))

export const FinalCTASection = () => {
   const { group } = useGroup()
   const { trigger, isMutating } = useStartPlanMutation(group.id)

   const handleStartTrial = () => {
      trigger({
         planType: GroupPlanTypes.Trial,
         groupId: group.id,
      })
   }

   return (
      <StyledFinalCTA>
         <StyledCTATitle>
            Get&nbsp;your&nbsp;brand seen&nbsp;now!
         </StyledCTATitle>
         <LoadingButton
            variant="contained"
            size="medium"
            color="secondary"
            loading={isMutating}
            onClick={handleStartTrial}
            sx={{ width: 258 }}
         >
            Start your free trial!
         </LoadingButton>
      </StyledFinalCTA>
   )
}
