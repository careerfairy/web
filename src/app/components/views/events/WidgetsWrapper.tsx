import { Box } from "@mui/material";
import { FC } from "react";

// @ts-ignore
const WidgetsWrapper: FC = ({ children }) => (
   <Box
      sx={(theme) => ({
         py: { xs: 1, sm: 4 },
         "& > *:not(:first-child)": {
            py: {
               xs: 1,
               sm: 4,
               borderTop: `0.5px solid ${theme.palette.grey["400"]}`,
            },
         },
         "& > *": {
            pb: {
               xs: 1,
               sm: 4,
            },
         },
      })}
   >
      {children}
   </Box>
);

// @ts-ignore
export default WidgetsWrapper;
