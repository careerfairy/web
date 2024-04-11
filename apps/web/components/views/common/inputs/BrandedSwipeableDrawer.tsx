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
         marginTop: "10px",
         marginBottom: "10px",
         width: "92px",
         height: "3px",
         backgroundColor: "#E1E1E1",
         borderRadius: "10px",
      },
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
   },
}))

export default BrandedSwipeableDrawer
