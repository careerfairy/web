import React from "react";
import { Card, CardContent, CardHeader } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

const styles = {
   root: {
      flex: 1,
      height: "100%",
      borderRadius: (theme) => theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
   },
   headerRoot: {
      display: "grid",
   },
   timestamp: {
      margin: "0 auto",
      borderRadius: (theme) => theme.spacing(1),
   },
};

const Spinner = () => {
   return (
      <Card sx={styles.root}>
         <CardHeader
            sx={styles.headerRoot}
            avatar={
               <Skeleton
                  sx={styles.timestamp}
                  animation="wave"
                  variant="rectangular"
                  width={55}
                  height={70}
               />
            }
         />
         <Skeleton
            animation="wave"
            height={150}
            variant="rectangular"
            sx={styles.media}
         />
         <CardContent>
            <Skeleton
               animation="wave"
               height={10}
               style={{ marginBottom: 6 }}
            />
            <Skeleton
               animation="wave"
               height={10}
               style={{ marginBottom: 6 }}
               width="80%"
            />
            <Skeleton animation="wave" height={10} width="60%" />
         </CardContent>

         <Skeleton animation="wave" height={150} variant="rectangular" />
      </Card>
   );
};

export default Spinner;
