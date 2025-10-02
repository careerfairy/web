import { OfflineEventStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { Box, Grid, Typography } from "@mui/material"
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete"
import { prettyDate } from "components/helperFunctions/HelperFunctions"
import AutocompleteSearch from "components/views/common/AutocompleteSearch"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { Search as FindIcon } from "react-feather"
import useSWR from "swr"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventAnalyticsPageContext } from "../OfflineEventAnalyticsPageProvider"

const styles = sxStyles({
   wrapper: {
      width: "100%",
      backgroundColor: (theme) => theme.brand.white[400],
      p: 2,
      px: 2,
      py: 1.5,
      gap: 1.25,
      display: "flex",
      flexDirection: "column",
   },
   listBox: {
      "& li": {
         backgroundColor: "transparent",
         "&:hover": {
            backgroundColor: (theme) =>
               theme.palette.action.hover + " !important",
         },
      },
   },
   listItemGrid: {
      width: "calc(100% - 44px)",
      wordWrap: "break-word",
      color: "neutral.700",
   },
   listItem: {
      padding: "12px !important",
   },
   listItemSelected: {
      backgroundColor: "white !important",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.action.hover + " !important",
      },
   },
   textField: {
      backgroundColor: "white",
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
   },
})

type OfflineEventOption = {
   id: string
   name: string
   stats: OfflineEventStats
}

const getOptionLabel = (option: OfflineEventOption) =>
   typeof option === "string" ? option : option.name

const isOptionEqualToValue = (
   option: OfflineEventOption,
   value: OfflineEventOption
) => option.id === value?.id

const OfflineEventSearchNav = () => {
   const { group } = useGroup()
   const router = useRouter()
   const { currentEventStats } = useOfflineEventAnalyticsPageContext()
   const [inputValue, setInputValue] = useState("")
   const [open, setOpen] = useState(false)

   const { data: offlineEventStats } = useSWR(
      [`group-${group.id}-published-offline-events`],
      async () => {
         return offlineEventService.getFutureAndPublishedOfflineEventStats(
            group.id
         )
      }
   )

   const options: OfflineEventOption[] = useMemo(
      () =>
         offlineEventStats?.map((stats) => ({
            id: stats.id,
            name: stats.offlineEvent.title,
            stats,
         })) ?? [],
      [offlineEventStats]
   )

   // Find current value from options, or create it from currentEventStats if not in the list
   const currentValue: OfflineEventOption | undefined = useMemo(() => {
      if (!currentEventStats) return undefined

      // First try to find it in the options
      const foundOption = options.find((opt) => opt.id === currentEventStats.id)
      if (foundOption) return foundOption

      // If not in options (e.g., past event), create option from currentEventStats
      return {
         id: currentEventStats.id,
         name: currentEventStats.offlineEvent.title,
         stats: currentEventStats,
      }
   }, [currentEventStats, options])

   // Sync inputValue with currentValue when not searching (e.g., on page load/refresh)
   useEffect(() => {
      if (currentValue && !open) {
         setInputValue(getOptionLabel(currentValue))
      }
   }, [currentValue, open])

   const handleChange = (value: OfflineEventOption | null) => {
      if (value) {
         router.push(
            `/group/${group.id}/admin/analytics/offline-events/${value.id}`
         )
      }
   }

   return (
      <Box sx={styles.wrapper}>
         <AutocompleteSearch
            id="offline-event-search"
            value={currentValue}
            inputValue={inputValue}
            handleChange={handleChange}
            options={options}
            renderOption={renderOption}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            inputStartIcon={
               <FindIcon color="#7A7A8E" strokeWidth={2} size={20} />
            }
            setInputValue={setInputValue}
            placeholderText="Search offline events"
            open={open}
            setOpen={setOpen}
            textFieldStyles={styles.textField}
         />
      </Box>
   )
}

const renderOption = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: OfflineEventOption,
   state: AutocompleteRenderOptionState
) => {
   const event = option.stats.offlineEvent

   return (
      <Box
         {...props}
         component="li"
         sx={[styles.listItem, state.selected && styles.listItemSelected]}
         key={option.id}
      >
         <Grid container alignItems="center">
            <Grid item sx={styles.listItemGrid}>
               <Typography variant="small" mb={1}>
                  {event.title}
               </Typography>
               <br />
               {Boolean(event.address?.city) && (
                  <Typography variant="xsmall" color="neutral.600">
                     {event.address.city}
                     {Boolean(event.address.country) &&
                        `, ${event.address.country}`}
                  </Typography>
               )}
               <br />
               <Typography mt={1} variant="xsmall" color="neutral.500">
                  {prettyDate(event.startAt)}
               </Typography>
            </Grid>
            <Grid item>
               {state.selected ? <CheckRoundedIcon fontSize="small" /> : null}
            </Grid>
         </Grid>
      </Box>
   )
}

export default OfflineEventSearchNav
