import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { Stack, Box, useTheme } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import React from "react"
import { Check, CheckCircle, XCircle } from "react-feather"
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
import { commafy } from "./GroupSparksPlanMobileSelector"

const styles = sxStyles({
   plansStack: {},
   planFeatures: {
      pt: 1,
      borderRadius: "12px",
   },
   planTitle: {
      fontFamily: "Poppins",
      fontSize: "32px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "48px",
   },
   planDescription: {
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",

      minHeight: "40px",
   },
   planPricing: {
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "24px",
   },
   planWrapper: {
      minWidth: "320px",
      maxWidth: "320px",
      minHeight: "160px",
      maxHeight: "160px",
      display: "flex",
      padding: "20px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "12px 12px 8px 8px",
   },
   contentWrapper: {
      borderRadius: "14px",
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
      ml: "280px",
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "27px",
      height: "27px",
      borderRadius: "50%",
   },
})

const GroupSparksPlanDesktopSelector = () => {
   return (
      <Stack spacing={4} direction={"row"} sx={styles.plansStack}>
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
   const { setPlan } = useSparksPlansForm()
   const { group } = useGroup()
   const theme = useTheme()
   const selectedPlan = useSelector(selectedPlanSelector)
   const selected = selectedPlan === props.plan
   const color = selected ? theme.brand.white[100] : "black"

   const selectedColor = theme.brand.purple[600]
   const unselectedColor = theme.palette.neutral[50]
   const featuresBackgroundColor = selected ? theme.brand.purple[50] : "#fff"
   const headerBorderColor = selected ? selectedColor : unselectedColor
   const headerBgColor = selected ? selectedColor : unselectedColor
   const checkBackgroundColor = selected ? theme.brand.purple[800] : "#D9D9D9"

   const features = PLAN_CONSTANTS[props.plan]?.features || []

   const planPriceId = getPlanConstants(props.plan).stripe.priceId(
      group.companyCountry.id
   )

   const { data: priceData } = useStripePrice(planPriceId)
   const stripePrice: Stripe.Price = priceData
      ? (priceData as Stripe.Price)
      : null

   return (
      <Box
         onClick={() => setPlan(props.plan)}
         sx={[
            styles.contentWrapper,
            {
               border: selected ? "1.5px solid" : "1px solid",
               borderColor: headerBorderColor,
               background: featuresBackgroundColor,
            },
         ]}
         key={props.plan}
      >
         <Box
            sx={[styles.selectedWrapper, { background: checkBackgroundColor }]}
         >
            <ConditionalWrapper condition={selected}>
               <Check size={18} color="white" />
            </ConditionalWrapper>
         </Box>
         <Stack
            direction={"column"}
            sx={[styles.planWrapper, { backgroundColor: headerBgColor }]}
            justifyContent={"space-around"}
         >
            <Box component="span" color={color} sx={styles.planTitle}>
               {props.title}
            </Box>

            <Box component="span" color={color} sx={styles.planDescription}>
               {props.description}
               <Box sx={{ mt: 1 }} />
            </Box>
            <Box component="span" color={color} sx={styles.planPricing}>
               <ConditionalWrapper condition={Boolean(stripePrice)}>
                  {commafy(stripePrice.unit_amount / 100) +
                     " " +
                     stripePrice.currency.toUpperCase() +
                     "/year"}
               </ConditionalWrapper>
            </Box>
         </Stack>
         <Stack
            direction={"column"}
            spacing={1}
            sx={[styles.planFeatures, { background: featuresBackgroundColor }]}
         >
            {features.map((feature, idx, items) => {
               return (
                  <Box key={feature.name}>
                     <Box pl={2}>
                        <GroupSparksPlanFeature
                           key={feature.name}
                           enabled={feature.enabled}
                           name={feature.name}
                        />
                     </Box>
                     <ConditionalWrapper
                        condition={idx != items.length - 1}
                        fallback={<Box mt={"10px"} />}
                     >
                        <hr style={styles.planSeparator} color="#E1E1E1" />
                     </ConditionalWrapper>
                  </Box>
               )
            })}
         </Stack>
      </Box>
   )
}

export default GroupSparksPlanDesktopSelector
