import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import { Chip, Stack, useTheme } from "@mui/material"
import AdvancedPlanIcon from "components/views/common/icons/AdvancedPlanIcon"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import EssentialPlanIcon from "components/views/common/icons/EssentialPlanIcon"
import PlanDaysLeftIcon from "components/views/common/icons/PlanDaysLeftIcon"
import PremiumPlanIcon from "components/views/common/icons/PremiumPlanIcon"
import TrialPlanIcon from "components/views/common/icons/TrialPlanIcon"
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
         pl: 2,
      },
   },
   daysLeftIcon: {
      mb: "1px",
   },
   expiredChip: {
      color: (theme) => theme.brand.error[500], //"#FF4545",
      bgcolor: (theme) => theme.brand.error[50],
      borderColor: (theme) => theme.brand.error[300],
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
               <ExpiredPlanChip presenter={presenter} />
            </Wrapper>
         )
      }

      return (
         <Wrapper>
            <PlanChip plan={presenter.plan.type} />
            <Chip
               variant="filled"
               sx={[styles.chip, styles.neutralChip]}
               icon={<PlanDaysLeftIcon sx={styles.daysLeftIcon} />}
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

const ExpiredPlanChip = ({ presenter }: Props) => {
   const theme = useTheme()
   const expiredLabel = presenter.hasNonTrialPlan()
      ? `${PLAN_CONSTANTS[presenter.plan.type].name} plan expired`
      : "Trial expired"

   const paidColor = theme.brand.error[500]
   const trialColor = theme.palette.error[500]

   const icon = getPlanIcon(presenter.plan.type, trialColor, paidColor)
   return (
      <Wrapper>
         <Chip
            variant="outlined"
            sx={[styles.chip, styles.expiredChip]}
            icon={icon}
            label={expiredLabel}
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

   const icon = getPlanIcon(plan, trialColor, paidColor)

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

const getPlanIcon = (
   type: GroupPlanType,
   trialColor: string,
   paidColor: string
) => {
   let icon

   if (type == GroupPlanTypes.Trial)
      icon = <TrialPlanIcon sx={{ color: trialColor }} />

   if (type == GroupPlanTypes.Tier1)
      icon = <EssentialPlanIcon sx={{ color: paidColor }} />

   if (type == GroupPlanTypes.Tier2)
      icon = <AdvancedPlanIcon sx={{ color: paidColor }} />

   if (type == GroupPlanTypes.Tier3)
      icon = <PremiumPlanIcon sx={{ color: paidColor }} />

   return icon
}

export default StatusChips
