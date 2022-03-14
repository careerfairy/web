import { Box } from "@mui/material";
import { FC } from "react";

const smallPadding = 2;
const largePadding = 4;
// @ts-ignore
const WidgetsWrapper: FC = ({ children }) => (
   <Box
      sx={(theme) => ({
         py: { xs: smallPadding, sm: largePadding },
         "& > *:not(:first-child)": {
            py: {
               xs: smallPadding,
               sm: largePadding,
               // borderTop: `0.5px solid ${theme.palette.grey["400"]}`,
            },
         },
         "& > *": {
            pb: {
               xs: smallPadding,
               sm: largePadding,
            },
         },
      })}
   >
      {children}
   </Box>
);

// @ts-ignore
export default WidgetsWrapper;
