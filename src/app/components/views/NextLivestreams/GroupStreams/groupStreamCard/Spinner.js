import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Card, CardContent, CardHeader } from "@mui/material";
import Skeleton from '@mui/material/Skeleton';

const useStyles = makeStyles((theme) => ({
   root: {
      flex: 1,
      height: "100%",
      borderRadius: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
   },
   headerRoot: {
      display: "grid",
   },
   timestamp: {
      margin: "0 auto",
      borderRadius: theme.spacing(1),
   },
}));

const Spinner = ({}) => {
   const classes = useStyles();

   return (
      <Card className={classes.root}>
         <CardHeader
            className={classes.headerRoot}
            avatar={
               <Skeleton
                  className={classes.timestamp}
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
            className={classes.media}
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
