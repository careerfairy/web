import { Pagination, styled } from "@mui/material"

export const BrandedPagination = styled(Pagination)(
   ({ theme, page, count }) => ({
      "& .MuiPagination-ul li:last-child button::before": {
         content: "'Next'",
         marginRight: theme.spacing(1.5),
         fontWeight: 400,
      },
      "& .MuiPagination-ul li:last-of-type": {
         display: "block",
         visibility: page == count ? "hidden" : "visible",
      },

      "& .MuiPagination-ul li:first-of-type button::after": {
         content: "'Back'",
         marginLeft: theme.spacing(1.5),
         fontWeight: 400,
      },
      "& .MuiPagination-ul li:first-of-type": {
         display: "block",
         visibility: page == 1 ? "hidden" : "visible",
      },
      "& .MuiPagination-ul li button": {
         fontWeight: 600,
         padding: theme.spacing(1, 2),
         color: theme.palette.neutral[700],
         margin: 0,
         "&.Mui-selected": {
            color: "white",
         },
         "&.MuiPaginationItem-page": {
            padding: 0,
            height: "24px",
            width: "24px",
            minWidth: "unset",
         },
      },
      "li:has(.MuiPaginationItem-ellipsis)": {
         display: "none",
      },
      ".MuiPagination-ul": {
         justifyContent: "end",
         gap: theme.spacing(1.5),
         [theme.breakpoints.down("sm")]: {
            justifyContent: "center",
         },
      },
   })
) as typeof Pagination
