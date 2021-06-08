import PropTypes from "prop-types";
import { Container } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   customMaxWidth:{

   }
}));

const SectionContainer = ({ children, ...props }) => {
   const classes = useStyles();
   return (
      <Container
        classes={{
           maxWidthLg: classes.customMaxWidth
        }}
         className={classes.root}
         {...props}
         children={children}
      />
   );
};

SectionContainer.propTypes = {
   children: PropTypes.node.isRequired,
};
export default SectionContainer;
