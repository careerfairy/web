import {
   Grid,
   LinearProgress,
   linearProgressClasses,
   styled,
   Tooltip,
   Typography,
} from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { VALID_SOURCES } from "../../analytics/RegistrationSources/sources"
import {
   sourcesByLivestream,
   UTMsPercentage,
} from "../../analytics/RegistrationSources/transformations"
import CardCustom from "../CardCustom"
import { useMainPageContext } from "../MainPageProvider"
import { useRegistrationSourcesData } from "./useRegistrationSourcesData"

const styles = sxStyles({
   header: {
      fontSize: "1.143rem",
      fontWeight: 600,
   },
   sourceText: {
      fontSize: "1rem",
   },
   grid: {
      "& .MuiGrid-item:last-child": {
         marginBottom: 0,
      },
   },
})

const CARD_OPTIONS = [
   "Next Live stream",
   "Last Live stream",
   "All live streams",
] as const

const TITLE = "Registration Sources Overview"

export const AggregatedRegistrationSourcesCard = () => {
   const { pastLivestream, nextLivestream } = useMainPageContext()

   if (
      pastLivestream === undefined || // loading
      nextLivestream === undefined || // loading
      (pastLivestream === null && nextLivestream === null) // both non existent
   ) {
      return (
         <CardCustom title={TITLE} options={CARD_OPTIONS}>
            <EmptySourcesProgress />
         </CardCustom>
      )
   }

   return <AllDataAvailable />
}

const AllDataAvailable = () => {
   const { group } = useGroup()
   const { pastLivestream, nextLivestream } = useMainPageContext()

   // set the dropdown options
   const options = useMemo(() => {
      const options = [...CARD_OPTIONS]

      if (!nextLivestream && pastLivestream) {
         // hide Next Livestream entry
         options.splice(0, 1)
         return options
      }

      if (!pastLivestream && nextLivestream) {
         // hide Past Livestream entry
         options.splice(1, 1)
         return options
      }

      return options
   }, [nextLivestream, pastLivestream])

   // select the livestream stats to display
   const [selectedLivestream, setSelectedLivestream] = useState(
      nextLivestream ? nextLivestream : pastLivestream
   )

   const optionsHandler = useCallback(
      (option: string) => {
         switch (option) {
            case CARD_OPTIONS[0]:
               setSelectedLivestream(nextLivestream)
               break
            case CARD_OPTIONS[1]:
               setSelectedLivestream(pastLivestream)
               break
            default:
               setSelectedLivestream(undefined) // will fetch all livestreams
         }
      },
      [nextLivestream, pastLivestream]
   )

   return (
      <CardCustom
         title={TITLE}
         options={options}
         optionsHandler={optionsHandler}
      >
         <LoadStaleWhileRevalidateStats
            // by changing the key, we reset the component state
            // useful to show a loading bar when fetching All Livestreams
            key={
               selectedLivestream?.id
                  ? "keep"
                  : "force re-render when switching to all livestreams"
            }
            groupId={group.id}
            livestream={selectedLivestream}
         />
      </CardCustom>
   )
}

const emptySources = [] // memoized
const EmptySourcesProgress = () => {
   // Show all sources but with 0's
   return <SourcesProgress sources={emptySources} />
}

const LoadStaleWhileRevalidateStats = ({ groupId, livestream }) => {
   const data = useRegistrationSourcesData(groupId, livestream?.id)

   // calculate the stats
   const stats = useMemo(() => {
      if (data.loading || !data.data) return []
      return sourcesByLivestream(data.data)
   }, [data])

   if (data.loading) {
      return <EmptySourcesProgress />
   }

   return (
      <>
         {/* Show a small progress bar when loading all livestreams since 
               it can take a while when there isn't any cache */}
         {/* @ts-ignore grey is a valid color */}
         {!livestream && !data.data && <LinearProgress color="grey" />}
         <SourcesProgress sources={stats} />
      </>
   )
}

const SourcesProgress = ({ sources }: { sources: UTMsPercentage[] }) => {
   const data: SourceEntryArgs[] = useMemo(() => {
      return VALID_SOURCES.map((s) => {
         const match = sources.find(
            (m) => m.source.displayName === s.displayName
         )

         return {
            name: s.displayName,
            help: s.helpDescription,
            value: match ? match.total : 0,
            percent: match ? match.percent : 0,
         }
      }).sort(sortSources)
   }, [sources])

   return (
      <Grid mt={1} sx={styles.grid} container>
         <Grid item xs={6}>
            <Typography sx={styles.header}>Channel</Typography>
         </Grid>
         <Grid mb={2} item xs={6} textAlign="right">
            <Typography sx={styles.header}>Users</Typography>
         </Grid>

         {data.map((s) => (
            <SourceEntry key={s.name} {...s} />
         ))}
      </Grid>
   )
}

type SourceEntryArgs = {
   name: string
   help: string
   value: number
   percent: number
}

const SourceEntry = ({ name, value, percent, help }: SourceEntryArgs) => {
   return (
      <>
         <Grid item xs={9}>
            <Tooltip title={help} placement="top" followCursor>
               <Typography sx={styles.sourceText}>{name}</Typography>
            </Tooltip>
         </Grid>
         <Grid item xs={3} textAlign="right">
            <Typography sx={styles.sourceText}>{value}</Typography>
         </Grid>
         <Grid mt={1} mb={2} item xs={12}>
            <BorderLinearProgress
               variant="determinate"
               color="primary"
               value={percent}
            />
         </Grid>
      </>
   )
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
   height: 12,
   borderRadius: 5,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[100],
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "primary",
   },
}))

function sortSources(a: SourceEntryArgs, b: SourceEntryArgs) {
   const order = [
      "Platform Registrations",
      "Platform User Promo",
      "Social",
      "University Network Promo",
      "Other",
   ]

   const idxFoundA = order.findIndex((o) => o === a.name)
   const idxFoundB = order.findIndex((o) => o === b.name)

   if (idxFoundA >= 0 && idxFoundB >= 0) return idxFoundA - idxFoundB

   return 0
}
