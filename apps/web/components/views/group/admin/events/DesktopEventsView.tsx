import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   Box,
   Stack,
   styled,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TableSortLabel,
   tooltipClasses,
   Typography,
   TypographyProps,
} from "@mui/material"
import { forwardRef, useState } from "react"
import { Calendar, ChevronDown, Eye, IconProps, User } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { checkIfPast } from "util/streamUtil"
import useClientSidePagination from "../../../../custom-hook/utils/useClientSidePagination"
import { BrandedTooltip } from "../../../streaming-page/components/BrandedTooltip"
import { StyledPagination } from "../common/CardCustom"
import { useEventsView } from "./context/EventsViewContext"
import { EventCardPreview } from "./events-table-new/EventCardPreview"
import { QuickActionIcon } from "./events-table-new/QuickActionIcon"
import { StatusIcon } from "./events-table-new/StatusIcon"
import { TableHighlighter } from "./events-table-new/TableHighlighter"
import { getEventStatsKey } from "./util"

const styles = sxStyles({
   tableContainer: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "secondary.50",
      overflowX: "auto",
      px: 1, // 8px horizontal padding to match Figma design
   },
   table: {
      borderCollapse: "separate",
      borderSpacing: "0px 8px",
      "& .MuiTableHead-root": {
         "& .MuiTableRow-root": {
            "& .MuiTableCell-root": {
               paddingBottom: 0, // 8px gap between header and body to match Figma
            },
         },
      },
   },
   tableHead: {
      backgroundColor: (theme) => theme.brand.white[100],
   },
   headerCell: {
      borderBottom: "none",
      py: 0,
      px: 2,
      backgroundColor: "transparent",
      height: 28,
      borderRadius: "4px",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "brand.white.500", // Light background on hover
      },
   },
   headerText: (theme) => ({
      fontWeight: 400,
      ...theme.typography.xsmall,
      color: "common.black",
   }),
   headerTextActive: {
      fontWeight: 600,
   },
   bodyRow: {
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      height: 80, // Fixed row height
      "& .MuiTableCell-root": {
         borderBottom: "none",
         py: 1,
         border: "1px solid",
         borderColor: (theme) => theme.brand.white[400],
         backgroundColor: (theme) => theme.brand.white[200],
         boxSizing: "border-box",
         transition: "all 0.2s ease-in-out",
         height: 80, // Fixed cell height
         verticalAlign: "top", // Align content to top
         "&:first-of-type": {
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            borderRight: "none",
         },
         "&:not(:first-of-type):not(:last-child)": {
            borderLeft: "none",
            borderRight: "none",
         },
         "&:last-child": {
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
            borderLeft: "none",
         },
      },
      "&:hover": {
         "& .MuiTableCell-root": {
            borderColor: "secondary.100", // Light purple border
            backgroundColor: (theme) => theme.brand.white[400], // Light background
         },
      },
   },
   bodyCell: {
      px: 2,
   },
   infoText: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      color: "neutral.600",
      whiteSpace: "nowrap",
   },
})

type Props = {
   stats: LiveStreamStats[]
}

const HeaderText = ({
   children,
   active,
}: TypographyProps & { active?: boolean }) => {
   return (
      <Typography sx={[styles.headerText, active && styles.headerTextActive]}>
         {children}
      </Typography>
   )
}

const HeaderIcon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => (
   <Box
      component="span"
      id="header-icon"
      ref={ref}
      sx={{
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         borderRadius: "4px",

         "& svg": {
            mr: 0,
         },
      }}
   >
      <ChevronDown size={16} {...props} />
   </Box>
))
HeaderIcon.displayName = "HeaderIcon"

const COLUMN_WIDTHS = {
   title: 350,
   date: 190,
   registrations: 92,
   views: 92,
   status: 40,
   actions: 38,
} as const

const CentredBox = styled(Box)({
   display: "flex",
   alignItems: "center",
   width: "100%",
   height: "100%",
})

type HeaderColumnWrapperProps = {
   children: React.ReactNode
   title: string
}

const HeaderColumnWrapper = ({ children, title }: HeaderColumnWrapperProps) => {
   return (
      <BrandedTooltip
         wrapperStyles={{
            display: "inline-flex",
         }}
         title={title}
         sx={{
            [`& .${tooltipClasses.tooltip}`]: {
               maxWidth: 294,
               textAlign: "start",
            },
         }}
         placement="bottom"
      >
         <Box
            component="span"
            sx={{
               px: 1,
               py: 0.5,
               borderRadius: "4px",
               "&:hover": {
                  backgroundColor: (theme) => theme.brand.white[500],
               },
            }}
         >
            {children}
         </Box>
      </BrandedTooltip>
   )
}

export const DesktopEventsView = ({ stats }: Props) => {
   const {
      handleTableSort,
      getSortDirection,
      isActiveSort,
      handleEnterLiveStreamRoom,
      handleShareLiveStream,
      handleAnalytics,
      handleQuestions,
      handleFeedback,
      handleEdit,
      handleShareRecording,
   } = useEventsView()
   const [hoveredRow, setHoveredRow] = useState<string | null>(null)

   const { currentPageData, currentPage, totalPages, goToPage } =
      useClientSidePagination({
         data: stats,
         itemsPerPage: 10,
      })

   const handleRowMouseEnter = (statKey: string) => {
      setHoveredRow(statKey)
   }

   const handleRowMouseLeave = () => {
      setHoveredRow(null)
   }

   return (
      <Box>
         <TableContainer sx={styles.tableContainer}>
            <Table sx={styles.table}>
               <TableHead sx={styles.tableHead}>
                  <TableRow>
                     <TableCell sx={styles.headerCell}>
                        <TableSortLabel
                           active={isActiveSort("title")}
                           direction={getSortDirection("title")}
                           onClick={() => handleTableSort("title")}
                           IconComponent={HeaderIcon}
                        >
                           <HeaderText active={isActiveSort("title")}>
                              Live stream title
                           </HeaderText>
                        </TableSortLabel>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderColumnWrapper title="The date when your live stream is scheduled to occur or has already taken place.">
                           <TableSortLabel
                              active={isActiveSort("date")}
                              direction={getSortDirection("date")}
                              onClick={() => handleTableSort("date")}
                              IconComponent={HeaderIcon}
                           >
                              <HeaderText active={isActiveSort("date")}>
                                 Date
                              </HeaderText>
                           </TableSortLabel>
                        </HeaderColumnWrapper>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderColumnWrapper title="The number of talent who registered to your live stream.">
                           <TableSortLabel
                              active={isActiveSort("registrations")}
                              direction={getSortDirection("registrations")}
                              onClick={() => handleTableSort("registrations")}
                              IconComponent={HeaderIcon}
                           >
                              <HeaderText
                                 active={isActiveSort("registrations")}
                              >
                                 Registrations
                              </HeaderText>
                           </TableSortLabel>
                        </HeaderColumnWrapper>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderColumnWrapper title="The number of talent who watched your live stream, either live or recorded.">
                           <HeaderText>Views</HeaderText>
                        </HeaderColumnWrapper>
                     </TableCell>
                     <TableCell sx={styles.headerCell}>
                        <HeaderColumnWrapper title="Shows if your live stream is published, still a draft, or available as a recording.">
                           <HeaderText>Status</HeaderText>
                        </HeaderColumnWrapper>
                     </TableCell>
                     <TableCell
                        sx={styles.headerCell}
                        width={COLUMN_WIDTHS.actions}
                     >
                        {/* Actions column */}
                     </TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {currentPageData.map((stat) => {
                     const statKey = getEventStatsKey(stat)
                     const isPastEvent = checkIfPast(stat.livestream)
                     const isHovered = hoveredRow === statKey

                     return (
                        <TableRow
                           key={statKey}
                           sx={styles.bodyRow}
                           onMouseEnter={() => handleRowMouseEnter(statKey)}
                           onMouseLeave={handleRowMouseLeave}
                        >
                           {/* Title Column */}
                           <TableCell
                              variant="head"
                              id="title-column"
                              sx={[
                                 styles.bodyCell,
                                 { minWidth: COLUMN_WIDTHS.title },
                              ]}
                           >
                              <CentredBox>
                                 <EventCardPreview
                                    title={stat.livestream.title}
                                    speakers={stat.livestream.speakers}
                                    backgroundImageUrl={
                                       stat.livestream.backgroundImageUrl
                                    }
                                    showHoverActions={isHovered}
                                    isDraft={stat.livestream.isDraft}
                                    isPastEvent={isPastEvent}
                                    isNotRecorded={
                                       stat.livestream.denyRecordingAccess
                                    }
                                    onEnterLiveStreamRoom={() =>
                                       handleEnterLiveStreamRoom(stat)
                                    }
                                    onShareLiveStream={() =>
                                       handleShareLiveStream(stat)
                                    }
                                    onShareRecording={() =>
                                       handleShareRecording(stat)
                                    }
                                    onAnalytics={() => handleAnalytics(stat)}
                                    onQuestions={() => handleQuestions(stat)}
                                    onFeedback={() => handleFeedback(stat)}
                                    onEdit={() => handleEdit(stat)}
                                 />
                              </CentredBox>
                           </TableCell>

                           {/* Date Column */}
                           <TableCell>
                              <CentredBox
                                 flexShrink={0}
                                 width={COLUMN_WIDTHS.date}
                              >
                                 <TableHighlighter
                                    title="Live stream date"
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    color="neutral.600"
                                 >
                                    <Box component={Calendar} size={16} />
                                    <Typography
                                       variant="small"
                                       whiteSpace="nowrap"
                                    >
                                       {getEventDate(stat)}
                                    </Typography>
                                 </TableHighlighter>
                              </CentredBox>
                           </TableCell>

                           {/* Registrations Column */}
                           <TableCell>
                              <CentredBox>
                                 <TableHighlighter
                                    title="Registrations"
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    width={COLUMN_WIDTHS.registrations}
                                    color="neutral.600"
                                 >
                                    <Box component={User} size={16} />
                                    <Typography variant="small">
                                       {stat.generalStats
                                          .numberOfRegistrations || 0}
                                    </Typography>
                                 </TableHighlighter>
                              </CentredBox>
                           </TableCell>

                           {/* Views Column */}
                           <TableCell>
                              <CentredBox>
                                 <TableHighlighter
                                    title="Views"
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    width={COLUMN_WIDTHS.views}
                                    color="neutral.600"
                                 >
                                    <Box component={Eye} size={16} />
                                    <Typography variant="small">
                                       {"-"}
                                    </Typography>
                                 </TableHighlighter>
                              </CentredBox>
                           </TableCell>

                           {/* Status Column */}
                           <TableCell>
                              <CentredBox width={COLUMN_WIDTHS.status}>
                                 <StatusIcon
                                    isDraft={stat.livestream.isDraft}
                                    isPastEvent={isPastEvent}
                                 />
                              </CentredBox>
                           </TableCell>

                           {/* Actions Column */}
                           <TableCell
                              padding="none"
                              sx={[{ maxWidth: COLUMN_WIDTHS.actions }]}
                           >
                              <CentredBox>
                                 <QuickActionIcon />
                              </CentredBox>
                           </TableCell>
                        </TableRow>
                     )
                  })}
               </TableBody>
            </Table>
         </TableContainer>

         {totalPages > 1 && (
            <Stack
               direction="row"
               justifyContent="flex-end"
               alignItems="center"
               spacing={2}
               mt={2}
            >
               <StyledPagination
                  color="secondary"
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => goToPage(page)}
               />
            </Stack>
         )}
      </Box>
   )
}

const getEventDate = (stat: LiveStreamStats) => {
   if (!stat.livestream.start) {
      return "No date"
   }

   const date = stat.livestream.start.toDate()
   const day = date.getDate().toString().padStart(2, "0")
   const month = date.toLocaleDateString("en-US", { month: "short" })
   const year = date.getFullYear().toString().slice(-2)
   const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
   })

   return `${day} ${month} ${year}, ${time}`
}
