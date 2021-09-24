import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import styles from "../../materialUI/styles/layoutStyles/embedLayoutStyles";
// import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const EmbedLayout = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <div className={classes.contentContainer}>
          <div className={classes.content}>
            {children}
            {/*<FooterV2 />*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedLayout;
