import { SwipeableDrawer, SwipeableDrawerProps } from "@mui/material"
import { styled } from "@mui/material/styles"

const BrandedSwipeableDrawer = styled((props: SwipeableDrawerProps) => (
   <SwipeableDrawer anchor="bottom" {...props} />
))(() => ({
   "& .MuiPaper-root": {
      ":before": {
         content: '""',
         display: "block",
         margin: "auto",
         marginTop: "14px",
         marginBottom: "14px",
         width: "92px",
         height: "4px !important",
         minHeight: "4px !important",
         maxHeight: "4px !important",
         backgroundColor: "rgb(149, 149, 149)",
         borderRadius: "10px",
      },
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
   },
}))

export default BrandedSwipeableDrawer
