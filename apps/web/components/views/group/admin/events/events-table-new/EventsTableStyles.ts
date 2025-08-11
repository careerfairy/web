import { sxStyles } from "types/commonTypes"

export const eventsTableStyles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "secondary.50",
      px: 1, // 8px horizontal padding to match Figma design
   },
   tableContainer: {
      // Custom nice scrollbar styles for table container
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

export const COLUMN_WIDTHS = {
   title: 350,
   date: 190,
   registrations: 150,
   views: 92,
   status: 40,
} as const
