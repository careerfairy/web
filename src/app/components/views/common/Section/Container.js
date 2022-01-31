import PropTypes from "prop-types";
import { Container } from "@mui/material";
import React from "react";
const styles = {
   root: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
};
const SectionContainer = ({
   className,
   maxWidth = "md",
   children,
   sx,
   ...props
}) => {
   return (
      <Container
         className={className}
         sx={[styles.root, sx]}
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
