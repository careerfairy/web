import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { Stack, Box } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import React from "react"
import { Check, CheckCircle, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useSparksPlansForm } from "../../GroupPlansDialog"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"

const styles = sxStyles({
   plansStack: {},
   planFeatures: {
      pt: 1,
      borderRadius: "12px",
   },
   planTitle: {
      // color: "var(--white-white---100, #FFF)",

      /* Desktop/Heading 2/H2 - Bold - Desktop */
      fontFamily: "Poppins",
      fontSize: "32px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "48px" /* 150% */,
   },
   planDescription: {
      /* Desktop/Text S/Text S - Regular - Desktop */
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px" /* 142.857% */,
   },
   planPricing: {
      /* Desktop/Body text/Body - SemiBold - Desktop */
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "24px" /* 150% */,
   },
   planWrapper: {
      minWidth: "280px",
      maxWidth: "280px",
      display: "flex",
      padding: "20px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "12px 12px 8px 8px",
      // background: "var(--purple-purple---600---Default, #6749EA)",
   },
   contentWrapper: {
      // width: "220px",
      // display: "flex",
      // padding: "20px",
      // flexDirection: "column",
      // justifyContent: "center",
      // alignItems: "flex-start",
      // gap: "8px",
      // alignSelf: "stretch",
      borderRadius: "14px",
      border: "1.5px solid var(--Purple-Purple---600---Default, #6749EA)",
      // background: "var(--Purple-Purple---50, #F0EDFD)",
      "&:hover": {
         cursor: "pointer",
      },
   },
   planSeparator: {
      // borderColor: "red",
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

const GroupSparksPlanDesktopSelector = () => {
   return (
      <Stack spacing={4} direction={"row"} sx={styles.plansStack}>
         <GroupSparksPlanComponent
            title="Essential"
            description="Jumpstart your employer branding"
            pricing="8.700 CHF/ year"
            plan={GroupPlanTypes.Tier1}
         />
         <GroupSparksPlanComponent
            title="Advanced"
            description="Scale up your employer brand narrative"
            pricing="8.700 CHF/ year"
            plan={GroupPlanTypes.Advanced}
         />
         <GroupSparksPlanComponent
            title="Premium"
            description="Gain unparalleled insights into your employer brand perception"
            pricing="8.700 CHF/ year"
            plan={GroupPlanTypes.Premium}
         />
      </Stack>
   )
}

type GroupSparksPlanFeatureProps = {
   name: string
   enabled: boolean
}
const GroupSparksPlanFeature = (props: GroupSparksPlanFeatureProps) => {
   const color = props.enabled
      ? "#6749EA"
      : "var(--neutral-neutral---800, #3D3D47)"

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
   pricing: string
   plan: GroupPlanType
}
const GroupSparksPlanComponent = (props: GroupSparksPlanProps) => {
   const { setPlan } = useSparksPlansForm()
   const selectedPlan = useSelector(selectedPlanSelector)
   const selected = selectedPlan === props.plan
   const color = selected ? "var(--white-white---100, #FFF)" : "black"

   const selectedColor = "var(--Purple-Purple---600---Default, #6749EA)"
   const unselectedColor = "var(--neutral-neutral---50, #EBEBEF)"
   const featuresBackgroundColor = selected
      ? "var(--purple-purple---50, #F0EDFD)"
      : "var(--white-white---400, #F6F6FA)"
   const headerBorderColor = selected ? selectedColor : unselectedColor
   const headerBgColor = selected ? selectedColor : unselectedColor
   const checkBackgroundColor = selected
      ? "var(--purple-purple---800, #523ABB)"
      : "#D9D9D9"

   const features = PLAN_CONSTANTS[props.plan]?.features || []

   // const checkout = useCallback( () => {
   //     goToCheckoutView(props.key)
   // }, [goToCheckoutView, props.key])
   return (
      <Box
         onClick={() => setPlan(props.plan)}
         sx={[
            styles.contentWrapper,
            {
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
         >
            <Box component="span" color={color} sx={styles.planTitle}>
               {props.title}
            </Box>

            <Box component="span" color={color} sx={styles.planDescription}>
               {props.description}
               <Box sx={{ mt: 1 }} />
            </Box>
            <Box component="span" color={color} sx={styles.planPricing}>
               {props.pricing}
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
