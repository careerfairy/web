import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { Stack, Box } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import React from "react"
import { Check, CheckCircle, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
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
      width: "220px",
      display: "flex",
      padding: "20px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "12px 12px 8px 8px",
      background: "var(--purple-purple---600---Default, #6749EA)",
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
      background: "var(--Purple-Purple---50, #F0EDFD)",
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
      // backgroundColor: "black",
      // borderRadius: "50%"
   },
})

const ESSENTIAL_FEATURES: GroupSparksPlanFeatureProps[] = [
   {
      enabled: true,
      name: "6 Sparks slots",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Up to 4 featured employees",
   },
   {
      enabled: false,
      name: "Reach and audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: false,
      name: "Dedicated KAM",
   },
   {
      enabled: false,
      name: "4'000 - 5’000 Exposure range",
   },
]
const GroupSparksPlanDesktopSelector = () => {
   const [checked, setChecked] = React.useState([1])

   const handleToggle = (value: number) => () => {
      const currentIndex = checked.indexOf(value)
      const newChecked = [...checked]

      if (currentIndex === -1) {
         newChecked.push(value)
      } else {
         newChecked.splice(currentIndex, 1)
      }

      setChecked(newChecked)
   }
   console.log("🚀 ~ handleToggle ~ handleToggle:", handleToggle)
   return (
      <Stack spacing={4} direction={"row"}>
         <GroupSparksPlanComponent
            title="Essential"
            description="Jumpstart your employer branding"
            pricing="8.700 CHF/ year"
            features={ESSENTIAL_FEATURES}
            selected
         />
         <GroupSparksPlanComponent
            title="Essential"
            description="Scale up your employer brand narrative"
            features={[]}
            pricing="8.700 CHF/ year"
         />
         <GroupSparksPlanComponent
            title="Essential"
            features={[]}
            description="Gain unparalleled insights into your employer brand perception"
            pricing="8.700 CHF/ year"
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
            fallback={<XCircle color={color} size={"21px"} />}
         >
            <CheckCircle color={color} size={"16px"} />
         </ConditionalWrapper>
         <Box>{props.name}</Box>
      </Stack>
   )
}
type GroupSparksPlanProps = {
   title: string
   description: string
   pricing: string
   features: GroupSparksPlanFeatureProps[]
   key?: GroupPlanType
   selected?: boolean
}
const GroupSparksPlanComponent = (props: GroupSparksPlanProps) => {
   const color = props.selected ? "var(--white-white---100, #FFF)" : "black"
   return (
      <Box sx={styles.contentWrapper}>
         <Stack direction={"column"} sx={styles.planWrapper}>
            <ConditionalWrapper condition={props.selected}>
               <Box display={"flex"} justifyContent={"flex-end"}>
                  <Box sx={styles.selectedIcon}>
                     <Check />
                  </Box>
               </Box>
            </ConditionalWrapper>
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
         <Stack direction={"column"} spacing={1} sx={{ mt: 2 }}>
            {props.features.map((feature) => {
               return (
                  <>
                     <Box pl={2}>
                        <GroupSparksPlanFeature
                           key={feature.name}
                           enabled={feature.enabled}
                           name={feature.name}
                        />
                     </Box>
                     <Box>
                        <hr style={styles.planSeparator} color="#E1E1E1" />
                     </Box>
                  </>
               )
            })}
         </Stack>
      </Box>
   )
}

export default GroupSparksPlanDesktopSelector
