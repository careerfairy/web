import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { Typography, CircularProgress } from "@material-ui/core";

const CustomInfiniteScroll = ({ children, ...props }) => {
   return (
      <InfiniteScroll
         {...props}
         loader={
            <Typography
               component="div"
               style={{ marginTop: "1rem" }}
               align="center"
            >
               <CircularProgress color="primary" />
            </Typography>
         }
      >
         {children}
      </InfiniteScroll>
   );
};

export default CustomInfiniteScroll;
