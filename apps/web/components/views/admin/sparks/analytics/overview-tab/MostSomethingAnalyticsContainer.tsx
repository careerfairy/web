import { FC, useState } from "react"
import { Box, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useGroup } from "layouts/GroupDashboardLayout"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import SparksStaticCard from "../components/SparksStaticCard"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { ResponsiveSelectWithDrawer } from "../components/ResponsiveSelectWithDrawer"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import {
   MostSomethingData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import EmptyDataCheckerForMostSomething from "./EmptyDataCheckers"

const styles = sxStyles({
   mostSomethingContainerTitleContainer: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
      marginBottom: "21px",
      display: "flex",
      alignItems: "center",
   },
   mostSomethingSelect: {
      width: "100%",
      textTransform: "lowercase",
      color: "#6749EA",
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
   },
   mostSomethingSelectMenu: {
      marginTop: 4,
      marginLeft: "-3px",
      ".MuiPaper-root": {
         minWidth: "0 !important",
      },
   },
   mostSomethingSelectContainer: {
      "& .MuiSelect-select": {
         paddingLeft: "0 !important",
         paddingTop: "0 !important",
         paddingBottom: "0 !important",
      },
      "& fieldset": {
         "&.MuiOutlinedInput-notchedOutline": {
            border: "0 !important",
         },
      },
   },
})

type MostSomethingSelectOption = {
   value: keyof MostSomethingData
   label: string
}

const mostSomethingSelectOptions: MostSomethingSelectOption[] = [
   { value: "watched", label: "Most watched Sparks" },
   { value: "liked", label: "Most liked Sparks" },
   { value: "shared", label: "Most shared Sparks" },
   { value: "recent", label: "Most recent Sparks" },
]

type MostSomethingTitleProps = {
   selectMostSomething: keyof MostSomethingData
   setSelectMostSomething: React.Dispatch<
      React.SetStateAction<keyof MostSomethingData>
   >
   options: MostSomethingSelectOption[]
}

const MostSomethingTitle: FC<MostSomethingTitleProps> = ({
   selectMostSomething,
   setSelectMostSomething,
   options,
}) => {
   return (
      <Box sx={styles.mostSomethingContainerTitleContainer}>
         Your&nbsp;
         <ResponsiveSelectWithDrawer
            selectValue={selectMostSomething}
            setSelectValue={setSelectMostSomething}
            options={options}
            selectProps={{
               sx: styles.mostSomethingSelect,
            }}
            selectMenuProps={{
               anchorOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               sx: styles.mostSomethingSelectMenu,
            }}
            selectContainerProps={{ sx: styles.mostSomethingSelectContainer }}
         />
      </Box>
   )
}

type MostSomethingAnalyticsContainerProps = {
   timeFilter: TimePeriodParams
}

const MostSomethingAnalyticsContainer: FC<
   MostSomethingAnalyticsContainerProps
> = ({ timeFilter }) => {
   const { group } = useGroup()
   const { most } = useSparksAnalytics(group.id)[timeFilter]

   const [selectMostSomethingValue, setSelectMostSomethingValue] =
      useState<keyof MostSomethingData>("watched")

   return (
      <GroupSparkAnalyticsCardContainer>
         <MostSomethingTitle
            selectMostSomething={selectMostSomethingValue}
            setSelectMostSomething={setSelectMostSomethingValue}
            options={mostSomethingSelectOptions}
         />
         {most[selectMostSomethingValue]?.length === 0 ? (
            <EmptyDataCheckerForMostSomething />
         ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
               {most[selectMostSomethingValue].map((sparkId, index) => (
                  <SparksStaticCard
                     key={`most-${selectMostSomethingValue}-${sparkId}-${index}`}
                     sparkId={sparkId}
                  />
               ))}
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}

export default MostSomethingAnalyticsContainer
