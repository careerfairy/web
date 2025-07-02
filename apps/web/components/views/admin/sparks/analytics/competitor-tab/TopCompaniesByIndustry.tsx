import {
   CompetitorCompanyData,
   CompetitorTopCompaniesBase,
} from "@careerfairy/shared-lib/sparks/analytics"
import { sxStyles } from "@careerfairy/shared-ui"
import {
   Box,
   Collapse,
   Grid,
   IconButton,
   Stack,
   SxProps,
   TableSortLabel,
   Typography,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { placeholderAvatar } from "constants/images"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { combineStyles } from "types/commonTypes"
import { numberToString } from "util/CommonUtil"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { SparksCarousel } from "../components/SparksCarousel"
import { TitleWithSelect } from "../components/TitleWithSelect"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { CompetitorSparkStaticCard } from "./CompetitorSparkStaticCard"
import { EmptySparksList } from "./EmptySparksList"

const styles = sxStyles({
   collapsibleTableRoot: {
      overflow: "auto",
   },
   collapsibleTableContainer: {
      minWidth: "850px",
   },
   normalText: {
      fontSize: "13px",
      fontWeight: 400,
      textAlign: "center",
      color: (theme) => theme.palette.neutral[700],
      padding: 0,
      "& .MuiTableSortLabel-root": {
         color: "inherit !important",
      },
   },
   rowBorderRadius: {
      borderRadius: "8px",
   },
   ownGroupTableBackground: {
      background: (theme) => theme.palette.secondary.light,
   },
   openedRowBackground: {
      background: (theme) => theme.brand.white[400],
   },
   statCell: {
      display: "flex",
      justifyContent: "center",
      textAlign: "center !important",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      color: (theme) => theme.palette.neutral[700],
      "&:after": {
         // used to center text with header text because of empty sorting icon
         content: '""',
         width: "32px",
         height: "32px",
      },
   },
   rankCell: {
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "20px",
      textAlign: "center",
      color: (theme) => theme.palette.neutral[600],
      paddingRight: 1,
   },
   companyNameCell: {
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "24px",
      textAlign: "left",
      color: (theme) => theme.palette.neutral[800],
      ...getMaxLineStyles(1),
   },
   textAlignCenter: {
      textAlign: "center",
   },
   companyDataContainer: {
      display: "flex",
      alignItems: "center",
      gap: 1,
   },
   collapse: {
      overflow: "hidden",
      marginLeft: 1.5,
   },
})

export const TopCompaniesByIndustry = () => {
   const {
      filteredAnalytics: { topCompaniesByIndustry },
      selectTimeFilter,
      industriesOptionsTopCompanies,
   } = useSparksAnalytics()

   const [selectIndustryValue, setSelectIndustryValue] = useState<string>("all")

   return (
      <GroupSparkAnalyticsCardContainer>
         <TitleWithSelect
            title="Top Companies by industry:&nbsp;"
            selectedOption={selectIndustryValue}
            setSelectedOption={setSelectIndustryValue}
            options={industriesOptionsTopCompanies}
         />
         {topCompaniesByIndustry[selectIndustryValue] &&
         topCompaniesByIndustry[selectIndustryValue].length > 0 ? (
            <CollapsibleTable
               rows={topCompaniesByIndustry[selectIndustryValue]}
            />
         ) : (
            <EmptySparksList
               targetLabel="industry"
               timePeriod={selectTimeFilter}
            />
         )}
      </GroupSparkAnalyticsCardContainer>
   )
}

type OrderingKey = keyof Pick<
   CompetitorCompanyData,
   | "rank"
   | "totalViews"
   | "unique_viewers"
   | "avg_watched_time"
   | "avg_watched_percentage"
   | "engagement"
>

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
   if (b[orderBy] < a[orderBy]) {
      return -1
   }
   if (b[orderBy] > a[orderBy]) {
      return 1
   }
   return 0
}

function ascendingComparator<T>(a: T, b: T, orderBy: keyof T) {
   return -descendingComparator(a, b, orderBy)
}

type Order = "asc" | "desc"

function getComparator(
   order: Order,
   orderBy: OrderingKey
): (a: CompetitorTopCompaniesBase, b: CompetitorTopCompaniesBase) => number {
   return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => ascendingComparator(a, b, orderBy)
}

type SortableHeadCell = {
   id: OrderingKey
   label: string
   size: number
}

const sortableHeadCells: SortableHeadCell[] = [
   { id: "totalViews", label: "Total Views", size: 1.3 },
   { id: "unique_viewers", label: "Unique Viewers", size: 1.6 },
   { id: "avg_watched_time", label: "Avg. watch time", size: 1.7 },
   { id: "avg_watched_percentage", label: "Avg. completion", size: 1.6 },
   { id: "engagement", label: "Total engagement", size: 1.8 },
]

const GridContainer = ({
   children,
   sx,
}: {
   children: React.ReactNode
   sx?: SxProps
}) => {
   return (
      <Grid
         container
         rowGap={1}
         sx={combineStyles(sx, [
            { alignItems: "center" },
            styles.rowBorderRadius,
         ])}
      >
         {children}
      </Grid>
   )
}

const GRID_SIZES = [0.5, 3]

type CollapsibleTableProps = {
   rows: CompetitorTopCompaniesBase[]
}

const CollapsibleTable = ({ rows }: CollapsibleTableProps) => {
   const { group } = useGroup()
   const [order, setOrder] = useState<Order>("asc")
   const [orderBy, setOrderBy] = useState<OrderingKey>("rank")

   const handleRequestSort = (property: OrderingKey) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property)
   }

   const sortedRows = useMemo(() => {
      const hasGroup = rows.some(
         (row) => row.sparks[0]?.sparkData.group.id === group.groupId
      )
      const sortedRows = [...rows].sort(getComparator(order, orderBy))

      if (hasGroup) {
         return sortedRows
      } else {
         const emptyGroupRow: CompetitorTopCompaniesBase = {
            sparks: [],
            groupLogo: group.logoUrl,
            groupName: group.universityName,
            // @ts-ignore
            rank: "⏤",
            highlight: true,
            totalViews: 0,
            unique_viewers: 0,
            avg_watched_time: 0,
            avg_watched_percentage: 0,
            engagement: 0,
         }

         return [...sortedRows, emptyGroupRow]
      }
   }, [
      group.groupId,
      group.logoUrl,
      group.universityName,
      order,
      orderBy,
      rows,
   ])

   return (
      <Box sx={styles.collapsibleTableRoot}>
         <Stack rowGap={2} sx={styles.collapsibleTableContainer}>
            <GridContainer sx={styles.normalText}>
               <Grid item xs={GRID_SIZES[0]} />
               <Grid item xs={GRID_SIZES[1]} sx={{ textAlign: "left" }}>
                  Company Name
               </Grid>
               {sortableHeadCells.map((headCell) => (
                  <Grid
                     item
                     key={headCell.id}
                     xs={headCell.size}
                     sx={{
                        textAlign: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                     }}
                  >
                     <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => {
                           handleRequestSort(headCell.id)
                        }}
                        IconComponent={ChevronDown}
                     >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                           <Box component="span" sx={visuallyHidden}>
                              {order === "desc"
                                 ? "sorted descending"
                                 : "sorted ascending"}
                           </Box>
                        ) : null}
                     </TableSortLabel>
                  </Grid>
               ))}
               <Grid item xs={GRID_SIZES[0]} />
            </GridContainer>
            {sortedRows.map((row, index) => (
               <Row
                  key={index}
                  tableIndex={row.rank}
                  row={row}
                  highlight={
                     row.groupLogo === group.logoUrl ||
                     row.sparks[0]?.sparkData?.group?.id === group.groupId
                  }
               />
            ))}
         </Stack>
      </Box>
   )
}

const StatCell = ({
   value,
   size = 1,
}: {
   value: number | string
   size?: number
}) => {
   return (
      <Grid item xs={size} sx={styles.statCell}>
         {typeof value === "number" ? numberToString(value) : value}
      </Grid>
   )
}

type RowProps = {
   row: CompetitorTopCompaniesBase
   tableIndex: number
   highlight?: boolean
}

const Row = ({ row, tableIndex, highlight = false }: RowProps) => {
   const [open, setOpen] = useState(false)

   return (
      <GridContainer
         sx={[
            highlight
               ? styles.ownGroupTableBackground
               : open
               ? styles.openedRowBackground
               : {},
            Boolean(!highlight) && { "&:hover": styles.openedRowBackground },
            { paddingY: 1 },
         ]}
      >
         <Grid item xs={GRID_SIZES[0]} sx={styles.rankCell}>
            {typeof tableIndex === "number" ? `#${tableIndex}` : tableIndex}
         </Grid>
         <Grid item xs={GRID_SIZES[1]}>
            <Box sx={styles.companyDataContainer}>
               <CircularLogo
                  src={row.groupLogo || placeholderAvatar}
                  alt={`${row.groupName} logo`}
                  size={46}
                  objectFit="cover"
               />
               <Typography sx={styles.companyNameCell}>
                  {row.groupName}
               </Typography>
            </Box>
         </Grid>
         <StatCell size={sortableHeadCells[0].size} value={row.totalViews} />
         <StatCell
            size={sortableHeadCells[1].size}
            value={row.unique_viewers}
         />
         <StatCell
            size={sortableHeadCells[2].size}
            value={Math.ceil(row.avg_watched_time) + "s"}
         />
         <StatCell
            size={sortableHeadCells[3].size}
            value={Math.ceil(row.avg_watched_percentage * 100) + "%"}
         />
         <StatCell
            size={sortableHeadCells[4].size}
            value={Math.ceil(row.engagement)}
         />
         <Grid item xs={GRID_SIZES[0]} sx={styles.textAlignCenter}>
            {row.sparks.length > 0 && (
               <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
               >
                  {open ? <ChevronUp /> : <ChevronDown />}
               </IconButton>
            )}
         </Grid>
         {row.sparks.length > 0 && (
            <Collapse
               in={open}
               timeout="auto"
               unmountOnExit
               sx={styles.collapse}
            >
               <Typography variant="brandedH4" fontWeight={600}>
                  Top Sparks
               </Typography>
               <Stack
                  direction={{ xs: "column", md: "row" }}
                  sx={{ mt: 1, mb: 2 }}
                  spacing={1.5}
               >
                  <SparksCarousel>
                     {row.sparks.map((spark, index) => (
                        <CompetitorSparkStaticCard
                           key={`top-sparks-by-industry-${row.groupName}-${index}`}
                           sparkData={spark.sparkData}
                           num_views={spark.num_views}
                           avg_watched_time={spark.avg_watched_time}
                           avg_watched_percentage={spark.avg_watched_percentage}
                           engagement={spark.engagement}
                           turnOffHighlighting={true}
                        />
                     ))}
                  </SparksCarousel>
               </Stack>
            </Collapse>
         )}
      </GridContainer>
   )
}
