import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { Stack, Box, useTheme } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import React from "react"
import { CheckCircle, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useSparksPlansForm } from "../../GroupPlansDialog"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import {
   PLAN_CONSTANTS,
   getPlanConstants,
} from "@careerfairy/shared-lib/groups/planConstants"
import { useGroup } from "layouts/GroupDashboardLayout"
import useStripePrice from "components/custom-hook/stripe/useStripePrice"
import Stripe from "stripe"

const styles = sxStyles({
   plansStack: {},
   planFeatures: {
      pt: 1,
      borderRadius: "12px",
   },
   planTitle: {
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "24px" /* 150% */,
   },
   selectedPlanTitle: {
      color: (theme) => theme.palette.neutral[800],
      fontFamily: "Poppins",
      fontSize: "32px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "48px" /* 150% */,
   },
   selectedPlanDescription: {
      color: (theme) => theme.palette.neutral[700],
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px" /* 142.857% */,
   },
   planDescription: {
      fontFamily: "Poppins",
      fontSize: "10px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "normal",
      opacity: 0.8,
   },
   planPricing: {
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "24px",
   },
   selectedPlanPrice: {
      color: (theme) => theme.palette.neutral[800],
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "24px" /* 150% */,
   },
   planWrapper: {
      width: "100%",
      display: "flex",
      py: "20px",
      px: {
         xs: "13px",
         md: "40px",
      },
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "12px 12px 8px 8px",
   },
   contentWrapper: {
      minWidth: "80px",
      borderRadius: "14px",
      border: "1.5px solid",
      borderColor: (theme) => theme.brand.purple[600],
      "&:hover": {
         cursor: "pointer",
      },
   },
   planSeparator: {
      opacity: "0.3",
      background: "#E1E1E1",
      height: "1px",
   },
   selectedIcon: {
      position: "absolute",
      left: 210,
      backgroundColor: "black",
      borderRadius: "50%",
   },
   selectedWrapper: {
      mt: "15px",
      ml: "240px",
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "27px",
      height: "27px",
      borderRadius: "50%",
   },
})

const GroupSparksPlanMobileSelector = () => {
   const { group } = useGroup()
   const selectedPlan = useSelector(selectedPlanSelector)
   const features =
      (!selectedPlan && []) || PLAN_CONSTANTS[selectedPlan]?.features || []
   const planPriceId = getPlanConstants(selectedPlan).stripe.priceId(
      group.companyCountry.id
   )

   const { data: priceData } = useStripePrice(planPriceId)
   const stripePrice: Stripe.Price = priceData
      ? (priceData as Stripe.Price)
      : null

   return (
      <Stack>
         <Stack
            spacing={1}
            direction={"column"}
            sx={styles.plansStack}
            justifyContent={"center"}
         >
            <Stack
               spacing={1}
               direction={"row"}
               justifyContent={"space-between"}
            >
               <GroupSparksPlanComponent
                  title={PLAN_CONSTANTS[GroupPlanTypes.Tier1].name}
                  description={PLAN_CONSTANTS[GroupPlanTypes.Tier1].description}
                  plan={GroupPlanTypes.Tier1}
               />
               <GroupSparksPlanComponent
                  title={PLAN_CONSTANTS[GroupPlanTypes.Tier2].name}
                  description={PLAN_CONSTANTS[GroupPlanTypes.Tier2].description}
                  plan={GroupPlanTypes.Tier2}
               />
               <GroupSparksPlanComponent
                  title={PLAN_CONSTANTS[GroupPlanTypes.Tier3].name}
                  description={PLAN_CONSTANTS[GroupPlanTypes.Tier3].description}
                  plan={GroupPlanTypes.Tier3}
               />
            </Stack>

            <Stack spacing={1}>
               <Box component="span" sx={styles.selectedPlanTitle}>
                  {PLAN_CONSTANTS[selectedPlan].name}
               </Box>
               <Box component="span" sx={styles.selectedPlanDescription}>
                  {PLAN_CONSTANTS[selectedPlan].description}
               </Box>
               <Box component="span" sx={styles.selectedPlanPrice}>
                  <ConditionalWrapper condition={Boolean(stripePrice)}>
                     {commafy((stripePrice.unit_amount / 100).toFixed(2)) +
                        stripePrice?.currency.toUpperCase() +
                        "/ year"}
                  </ConditionalWrapper>
               </Box>
            </Stack>
            <Stack direction={"column"} spacing={2} sx={[styles.planFeatures]}>
               {features.map((feature) => {
                  return (
                     <Box key={feature.name}>
                        <GroupSparksPlanFeature
                           key={feature.name}
                           enabled={feature.enabled}
                           name={feature.name}
                        />
                     </Box>
                  )
               })}
            </Stack>
         </Stack>
      </Stack>
   )
}

type GroupSparksPlanFeatureProps = {
   name: string
   enabled: boolean
}
const GroupSparksPlanFeature = (props: GroupSparksPlanFeatureProps) => {
   const theme = useTheme()
   const color = props.enabled ? "#6749EA" : theme.palette.neutral[800]

   return (
      <Stack direction={"row"} spacing={1}>
         <ConditionalWrapper
            condition={props.enabled}
            fallback={<XCircle color={color} size={"16px"} opacity={0.2} />}
         >
            <CheckCircle color={color} size={"16px"} />
         </ConditionalWrapper>
         <Box sx={{ opacity: props.enabled ? 1 : 0.2 }}>{props.name}</Box>
      </Stack>
   )
}
type GroupSparksPlanProps = {
   title: string
   description: string
   plan: GroupPlanType
}
const GroupSparksPlanComponent = (props: GroupSparksPlanProps) => {
   const theme = useTheme()
   const { setPlan } = useSparksPlansForm()
   const selectedPlan = useSelector(selectedPlanSelector)
   const selected = selectedPlan === props.plan
   const color = selected ? theme.brand.white[100] : theme.palette.neutral[700]

   const descriptionColor = selected
      ? theme.brand.white[100]
      : theme.palette.neutral[500]
   const selectedColor = theme.brand.purple[600]
   const unselectedColor = theme.palette.neutral[50]
   const headerBorderColor = selected ? selectedColor : unselectedColor
   const headerBgColor = selected ? selectedColor : unselectedColor

   const features = PLAN_CONSTANTS[props.plan]?.features || []

   const lastFeature =
      (features.length && features.at(features.length - 1).name) || ""
   return (
      <Box
         onClick={() => setPlan(props.plan)}
         sx={[
            styles.contentWrapper,
            {
               borderColor: headerBorderColor,
               background: headerBgColor,
            },
         ]}
         key={props.plan}
      >
         <Stack
            direction={"column"}
            sx={[styles.planWrapper, { backgroundColor: headerBgColor }]}
         >
            <Box component="span" color={color} sx={styles.planTitle}>
               {props.title}
            </Box>

            <Box
               component="span"
               color={descriptionColor}
               sx={styles.planDescription}
            >
               {lastFeature}
               <Box sx={{ mt: 1 }} />
            </Box>
         </Stack>
      </Box>
   )
}
export function commafy(num) {
   const numStr = num + ""

   if (numStr.includes(".")) {
      return numStr
   }

   return numberWith(numStr, "’")
}

function numberWith(x, separator) {
   return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, separator)
}
export default GroupSparksPlanMobileSelector
