import React from "react";
import { Box, Grid } from "@mui/material";
import withStyles from '@mui/styles/withStyles';

const StyledBox = withStyles((theme) => ({
   root: {
      background: "white",
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
   },
}))(Box);

const FormGroup = ({
   children,
   borderRadius = 4,
   container = true,
   spacing = 2,
   p = 1,
   boxShadow = 1,
   ...props
}) => {
   return (
      <StyledBox
         borderRadius={borderRadius}
         component={Grid}
         boxShadow={boxShadow}
         p={p}
         spacing={spacing}
         container={container}
         {...props}
      >
         {children}
      </StyledBox>
   );
};

export default FormGroup;
