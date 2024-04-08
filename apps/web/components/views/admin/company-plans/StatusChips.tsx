import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import { Chip, Stack, useTheme } from "@mui/material"
import AdvancedPlanIcon from "components/views/common/icons/AdvancedPlanIcon"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import EssentialPlanIcon from "components/views/common/icons/EssentialPlanIcon"
import PremiumPlanIcon from "components/views/common/icons/PremiumPlanIcon"
import TrialPlanIcon from "components/views/common/icons/TrialPlanIcon"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   chip: {
      py: 0.5,
      px: 1.5,
      "& svg": {
         width: 16,
         height: 16,
         color: "inherit !important",
      },
      "& .MuiChip-label": {
         pl: 1,
      },
   },
   expiredChip: {
      color: "#FF4545",
      bgcolor: "#FFE8E8",
      borderColor: "#FFA2A2",
   },
   neutralChip: {
      color: "#9999B1",
      borderColor: "#9999B1",
      bgcolor: "#F6F6FA",
   },
   onTrialChip: {
      color: "primary.600",
      borderColor: "primary.600",
      bgcolor: "#F1FCF9",
   },
   paidChips: {
      color: (theme) => theme.brand.purple[600],
      fontWeight: 400,
      borderColor: "#D1C8F9",
      bgcolor: "#F0EDFD",
   },
   onSparkChip: {
      color: "#6749EA",
      borderColor: "#D1C8F9",
      bgcolor: "#F0EDFD",
   },
})

type Props = {
   presenter: GroupPresenter
}

const StatusChips = ({ presenter }: Props) => {
   const timeLeft = DateUtil.getDaysLeftFromMilliseconds(
      presenter.getPlanTimeLeft()
   )

   if (presenter.hasPlan()) {
      if (presenter.hasPlanExpired()) {
         return (
            <Wrapper>
               <Chip
                  variant="outlined"
                  sx={[styles.chip, styles.expiredChip]}
                  icon={<Clock />}
                  label="Trial expired"
               />
            </Wrapper>
         )
      }

      return (
         <Wrapper>
            <PlanChip plan={presenter.plan.type} />
            <Chip
               variant="filled"
               sx={[styles.chip, styles.neutralChip]}
               icon={<Clock />}
               label={`${timeLeft} left`}
            />
         </Wrapper>
      )
   }

   return (
      <Wrapper>
         <Chip
            variant="filled"
            sx={[styles.chip, styles.neutralChip]}
            icon={<BasicSparkIcon />}
            label="No Sparks plan"
         />
      </Wrapper>
   )
}

type PlanChipProps = {
   plan: GroupPlanType
}

const PlanChip = ({ plan }: PlanChipProps) => {
   const theme = useTheme()

   const isTrial = plan === GroupPlanTypes.Trial

   const paidColor = theme.brand.purple[600]
   const trialColor = theme.palette.primary[600]

   let icon = <TrialPlanIcon color={trialColor} />

   if (plan == GroupPlanTypes.Tier1)
      icon = <EssentialPlanIcon color={paidColor} />

   if (plan == GroupPlanTypes.Tier2)
      icon = <AdvancedPlanIcon color={paidColor} />

   if (plan == GroupPlanTypes.Tier3)
      icon = <PremiumPlanIcon color={paidColor} />

   const label = isTrial
      ? "On trial"
      : PLAN_CONSTANTS[plan].name.concat(" plan")
   return (
      <Chip
         variant="outlined"
         sx={[styles.chip, isTrial ? styles.onTrialChip : styles.paidChips]}
         icon={icon}
         label={label}
      />
   )
}

type WrapperProps = {
   children: React.ReactNode
}

const Wrapper = ({ children }: WrapperProps) => {
   return (
      <Stack direction="row" spacing={1}>
         {children}
      </Stack>
   )
}

export default StatusChips
