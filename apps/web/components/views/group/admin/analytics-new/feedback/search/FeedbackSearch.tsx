import React, { FC, useCallback, useMemo } from "react"
import { Card, Divider, ListItemIcon, ListItemText } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import LivestreamSearch, {
   LivestreamHit,
} from "../../../common/LivestreamSearch"
import Stack from "@mui/material/Stack"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import {
   SORT_DIRECTIONS,
   useFeedbackPageContext,
} from "../FeedbackPageProvider"
import { StyledMenuItem, StyledTextField } from "../../../common/inputs"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Search as FindIcon } from "react-feather"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { where } from "firebase/firestore"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
   stack: {
      flex: 1,
   },
   timeFrameSelect: {
      minWidth: {
         sm: 350,
      },
      justifyContent: "center",
   },
   listIcon: {
      display: "flex",
      justifyContent: "flex-end",
   },
   noMarginTop: {
      marginTop: "0px !important",
   },
})

const FeedbackSearch: FC = () => {
   const isMobile = useIsMobile()
   const { group } = useGroup()
   const { setSortDirection, sortDirection, handleOpenFeedbackDialog } =
      useFeedbackPageContext()

   const handleChange = useCallback(
      (hit: LivestreamHit | null) => {
         if (hit) {
            handleOpenFeedbackDialog(hit.id)
         }
      },
      [handleOpenFeedbackDialog]
   )

   const handleSortDirectionChange = useCallback(
      (
         event: React.ChangeEvent<{
            value: unknown
         }>
      ) => {
         setSortDirection(event.target.value as typeof sortDirection)
      },
      [setSortDirection]
   )

   const additionalConstraints = useMemo(
      () => (group?.id ? [where("groupIds", "array-contains", group.id)] : []),
      [group?.id]
   )

   return (
      <Card sx={styles.root}>
         <Stack
            sx={styles.stack}
            direction={isMobile ? "column" : "row"}
            spacing={2}
            divider={
               <Divider
                  flexItem
                  orientation={isMobile ? "horizontal" : "vertical"}
                  sx={isMobile ? styles.noMarginTop : undefined}
               />
            }
         >
            <LivestreamSearch
               orderByDirection={SORT_DIRECTIONS[sortDirection]}
               handleChange={handleChange}
               value={null}
               startIcon={<FindIcon color={"black"} />}
               additionalConstraints={additionalConstraints}
            />
            <StyledTextField
               sx={[styles.timeFrameSelect, isMobile && styles.noMarginTop]}
               id="select-sort-direction"
               select
               SelectProps={SelectProps}
               value={sortDirection}
               variant="outlined"
               onChange={handleSortDirectionChange}
            >
               {Object.keys(SORT_DIRECTIONS).map((direction) => (
                  <StyledMenuItem key={direction} value={direction}>
                     <ListItemText primary={direction} />
                     {sortDirection === direction ? (
                        <ListItemIcon sx={styles.listIcon}>
                           <CheckRoundedIcon fontSize="small" />
                        </ListItemIcon>
                     ) : null}
                  </StyledMenuItem>
               ))}
            </StyledTextField>
         </Stack>
      </Card>
   )
}

const SelectProps = {
   renderValue: (val) => val,
}

export default FeedbackSearch
