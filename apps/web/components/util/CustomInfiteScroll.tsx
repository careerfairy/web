import React, { FC, ReactNode } from "react"
import InfiniteScroll, { Props } from "react-infinite-scroll-component"

import { Typography, CircularProgress } from "@mui/material"

type CustomInfiniteScrollProps = Omit<Props, "loader"> & {
   loader?: ReactNode
}
const CustomInfiniteScroll: FC<CustomInfiniteScrollProps> = ({
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
