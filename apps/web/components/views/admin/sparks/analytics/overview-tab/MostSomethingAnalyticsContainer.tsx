import { MostSomethingData } from "@careerfairy/shared-lib/sparks/analytics"
import { Box, Stack } from "@mui/material"
import { FC, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { MostSomethingSparkStaticCard } from "../components/MostSomethingSparkStaticCard"
import { ResponsiveSelectWithDrawer } from "../components/ResponsiveSelectWithDrawer"
import { SparksCarousel } from "../components/SparksCarousel"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
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
      color: "#6749EA",
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      ".MuiSelect-select:first-letter": {
         textTransform: "lowercase",
      },
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

export const MostSomethingAnalyticsContainer = () => {
   const {
      filteredAnalytics: { most },
   } = useSparksAnalytics()

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
               <SparksCarousel>
                  {most[selectMostSomethingValue].map((data, index) => (
                     <MostSomethingSparkStaticCard
                        key={`most-${selectMostSomethingValue}-${index}`}
                        sparkData={data.sparkData}
                        num_views={data.num_views}
                        num_likes={data.num_likes}
                        num_shares={data.num_shares}
                        num_clicks={data.num_clicks}
                     />
                  ))}
               </SparksCarousel>
            </Stack>
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}
