import { SwipeableDrawer, SwipeableDrawerProps } from "@mui/material"
import { styled } from "@mui/material/styles"

type BrandedSwipeableDrawerProps = SwipeableDrawerProps & {
   hideDragHandle?: boolean
}

const BrandedSwipeableDrawer = styled(
   (props: BrandedSwipeableDrawerProps) => (
      <SwipeableDrawer anchor="bottom" {...props} />
   ),
   {
      shouldForwardProp: (prop) => prop !== "hideDragHandle",
   }
)(({ hideDragHandle }) => ({
   "& .MuiPaper-root": {
      ":before": hideDragHandle
         ? {}
         : {
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
