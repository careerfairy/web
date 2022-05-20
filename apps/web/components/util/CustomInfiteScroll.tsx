import React, { FC } from "react"
import InfiniteScroll, { Props } from "react-infinite-scroll-component"

import { Typography, CircularProgress } from "@mui/material"

const CustomInfiniteScroll: FC<Props> = ({
   children,
   loader = <CircularProgress />,
   ...props
}) => {
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
   )
}

export default CustomInfiniteScroll
