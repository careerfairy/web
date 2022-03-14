import React from "react";
import { Box, CircularProgress } from "@mui/material";

const StreamingLoader = () => {
   return (
      <Box
         sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
         }}
      >
         <CircularProgress />
      </Box>
   );
};

export default StreamingLoader;
