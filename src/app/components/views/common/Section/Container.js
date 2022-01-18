import PropTypes from "prop-types";
import { Container } from "@mui/material";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";

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
   customMaxWidth: {},
}));

const SectionContainer = ({
   className,
   maxWidth = "md",
   children,
   ...props
}) => {
   const classes = useStyles();
   return (
      <Container
         classes={{
            maxWidthLg: classes.customMaxWidth,
         }}
         className={clsx(classes.root, className)}
         maxWidth={maxWidth}
         {...props}
         children={children}
      />
   );
};

SectionContainer.propTypes = {
   children: PropTypes.node.isRequired,
};
export default SectionContainer;
