import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { LoadingButton } from "@mui/lab"
import { Badge, Box, Button, Chip, Stack, Typography } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import Link from "components/views/common/Link"
import CircularLogo from "components/views/common/logos/CircularLogo"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { companyPlanService } from "data/firebase/CompanyPlanService"
import React from "react"
import useSWRMutation, { MutationFetcher } from "swr/mutation"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: 3,
      bgcolor: "background.paper",
      "& .MuiButton-root": {
         textTransform: "none",
      },
   },
   name: {
      fontWeight: 600,
      fontSize: "1.286rem !important",
      textAlign: "center",
      ...getMaxLineStyles(1),
   },
   description: {
      textAlign: "center",
      ...getMaxLineStyles(2),
   },
   descWrapper: {
      height: 40,
      pt: 0.5,
   },
   adminPageBtn: {
      color: "text.secondary",
   },
   actions: {
      mt: 2.5,
   },
   noMouseEvents: {
      pointerEvents: "none",
   },
   expiredBtn: {
      backgroundColor: (theme) => `${theme.palette.error.main} !important`,
      color: (theme) => `${theme.palette.error.contrastText} !important`,
   },
   sparksMemberBtn: {
      backgroundColor: "#F6F6FA !important",
      color: "#CACACA !important",
   },
})

type Props = {
   presenter: GroupPresenter
}
const extraInfoToolipThreshold = 145

const CompanyPlanCard = React.memo(({ presenter }: Props) => {
   const extraInfo = presenter.extraInfo || ""

   return (
      <Box sx={styles.root}>
         <CircularLogo
            src={presenter.getCompanyLogoUrl()}
            alt={presenter.universityName}
            size={64}
         />
         <Box pt={1.5} />
         <Typography variant={"h6"} sx={styles.name}>
            {presenter.universityName}
         </Typography>
         <Box sx={styles.descWrapper}>
            <BrandedTooltip
               title={
                  extraInfo.length > extraInfoToolipThreshold ? extraInfo : ""
               }
               placement={"top"}
            >
               <Typography
                  sx={styles.description}
                  variant={"body2"}
                  color={"text.secondary"}
               >
                  {extraInfo}
               </Typography>
            </BrandedTooltip>
         </Box>
         <Stack spacing={0.5} sx={styles.actions}>
            <ActionButton presenter={presenter} />
            <Button
               component={Link}
               noLinkStyle
               size={"small"}
               color="grey"
               variant="text"
               href={`/group/${presenter.id}/admin`}
               sx={styles.adminPageBtn}
            >
               View admin page
            </Button>
         </Stack>
      </Box>
   )
})

type ActionButtonProps = {
   presenter: GroupPresenter
}

const fetcher: MutationFetcher<void, string, StartPlanData> = (_, { arg }) =>
   void companyPlanService.startPlan(arg)

const ActionButton = ({ presenter }: ActionButtonProps) => {
   const isTier1 = presenter.plan?.type === GroupPlanTypes.Tier1
   const isTrial = presenter.plan?.type === GroupPlanTypes.Trial

   const { successNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `startPlan-${presenter.id}`,
      fetcher
   )

   const daysLef =
      presenter.getPlanDaysLeft() > 0
         ? `${presenter.getPlanDaysLeft()} days left`
         : "Expired"

   const startPlan = async (planType: GroupPlanType) => {
      const planData: StartPlanData = {
         planType: planType,
         groupId: presenter.id,
      }
      successNotification(
         `Backend call to start ${planType} plan not implemented yet`
      )
      // await trigger(planData) TODO: uncomment this when backend is ready
   }

   if (presenter.hasPlan() && presenter.hasPlanExpired()) {
      return (
         <Button
            disabled
            sx={styles.expiredBtn}
            color="error"
            variant="contained"
         >
            Trial expired
         </Button>
      )
   }

   if (isTrial) {
      return (
         <Badge
            badgeContent={
               <Chip label={daysLef} size="small" color="secondary" />
            }
         >
            <LoadingButton
               onClick={() => startPlan(GroupPlanTypes.Tier1)}
               loading={isMutating}
               variant="outlined"
            >
               Activate Sparks plan
            </LoadingButton>
         </Badge>
      )
   }

   if (isTier1) {
      return (
         <Badge
            badgeContent={
               <Chip label={daysLef} size="small" color="secondary" />
            }
         >
            <Button sx={styles.sparksMemberBtn} disabled variant="contained">
               Sparks member
            </Button>
         </Badge>
      )
   }

   return (
      <LoadingButton
         onClick={() => startPlan(GroupPlanTypes.Trial)}
         loading={isMutating}
         variant="contained"
      >
         Activate Sparks trial
      </LoadingButton>
   )
}

CompanyPlanCard.displayName = "CompanyPlanCard"

export default CompanyPlanCard
