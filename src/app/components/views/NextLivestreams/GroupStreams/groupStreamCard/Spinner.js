import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

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
                  variant="rect"
                  width={55}
                  height={70}
               />
            }
         />
         <Skeleton
            animation="wave"
            height={150}
            variant="rect"
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

         <Skeleton animation="wave" height={150} variant="rect" />
      </Card>
   );
};

export default Spinner;
