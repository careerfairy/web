import React from "react";
import makeStyles from '@mui/styles/makeStyles';

import styles from "../../materialUI/styles/layoutStyles/embedLayoutStyles";

const useStyles = makeStyles(styles);

const EmbedLayout = ({ children }) => {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         <div className={classes.wrapper}>
            <div className={classes.contentContainer}>
               <div className={classes.content}>{children}</div>
            </div>
         </div>
      </div>
   );
};

export default EmbedLayout;
