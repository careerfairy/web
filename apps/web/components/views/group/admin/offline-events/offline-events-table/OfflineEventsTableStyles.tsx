import { sxStyles } from "types/commonTypes"

export const COLUMN_WIDTHS = {
   title: "150px", // Event name gets the most space
   date: "220px", // Date gets good space for readability
   clicks: "115px", // Clicks gets moderate space
   views: "115px", // Views gets moderate space
   status: "110px", // Status gets minimal space
} as const

export const offlineEventsTableStyles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "secondary.50",
      px: 1, // 8px horizontal padding to match Figma design
   },
   tableContainer: {
      width: "100%",
      // Only show scrollbar when content actually overflows
      overflowX: "auto",
      "& ::-webkit-scrollbar": {
         height: "6px",
         backgroundColor: "transparent",
      },
      "& ::-webkit-scrollbar-thumb": {
         borderRadius: "8px",
         backgroundColor: (theme) => theme.palette.neutral[200],
         minHeight: "24px",
      },
      "& ::-webkit-scrollbar-thumb:hover": {
         backgroundColor: (theme) => theme.palette.neutral[300],
      },
      // Firefox
      scrollbarWidth: "thin",
      scrollbarColor: (theme) => `${theme.palette.neutral[200]} transparent`,
   },
   table: {
      borderCollapse: "separate",
      borderSpacing: "0px 8px",
      width: "100%",
      tableLayout: "fixed", // Ensures columns respect the width percentages
      "& .MuiTableHead-root": {
         "& .MuiTableRow-root": {
            "& .MuiTableCell-root": {
               paddingBottom: 0, // 8px gap between header and body to match Figma
            },
         },
      },
   },
   paginationContainer: {
      mt: 1,
      pb: 1.5,
   },
   emptyCell: {
      p: 0,
      border: "none",
      px: 0.5,
      pb: 0.5,
   },
   emptyCard: {
      bgcolor: (theme) => theme.brand.white[200],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: 2,
      px: 1,
      textAlign: "center",
   },
})
