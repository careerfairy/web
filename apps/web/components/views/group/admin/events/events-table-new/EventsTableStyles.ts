import { sxStyles } from "types/commonTypes"

export const eventsTableStyles = sxStyles({
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
})

export const COLUMN_WIDTHS = {
   title: 350,
   date: 190,
   registrations: 92,
   views: 92,
   status: 40,
} as const
