import React from "react";
import { Box, Grid } from "@mui/material";

const FormGroup = ({
   children,
   borderRadius = 2,
   container = true,
   spacing = 2,
   p = 1,
   boxShadow = 1,
   ...props
}) => {
   return (
      <Box sx={{ flexGrow: 1, mt: 3, mb: 3, p }}>
         <Grid
            sx={{
               background: "white",
               boxShadow,
               borderRadius,
               pr: spacing,
               pb: spacing,
            }}
            spacing={spacing}
            container={container}
            {...props}
         >
            {children}
         </Grid>
      </Box>
   );
};

export default FormGroup;
