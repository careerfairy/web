import { Box } from "@mui/material"
import Skeleton from "@mui/material/Skeleton"
import React from "react"

const styles = {
   root: {
      flex: 1,
      height: "100%",
      borderRadius: (theme) => theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: 1,
      overflow: "hidden",
   },
   headerRoot: {
      display: "grid",
      width: "100%",
   },
   timestamp: {
      borderRadius: (theme) => theme.spacing(1),
      my: "10%",
      mx: "auto",
   },
   mediaWrapper: {
      width: "100%",
      height: "80%",
      p: "10%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   detailsWrapper: {
      width: "100%",
      height: "20%",
   },
}

const StreamCardSkeleton = () => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.mediaWrapper}>
            <Skeleton
               sx={styles.timestamp}
               animation={false}
               variant="rectangular"
               width={"60%"}
               height={"40%"}
            />
            <Skeleton animation={false} height={"7%"} />
            <Skeleton animation={false} height={"7%"} width="80%" />
            <Skeleton animation={false} height={"7%"} width="60%" />
         </Box>
         <Box sx={styles.detailsWrapper}>
            <Skeleton animation={false} height={"100%"} variant="rectangular" />
         </Box>
      </Box>
   )
}

export default StreamCardSkeleton
