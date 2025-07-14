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
         marginTop: "8.5px",
         marginBottom: "8.5px",
         width: "92px",
         height: "3px !important",
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
