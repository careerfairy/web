import PropTypes from "prop-types";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, Typography } from "@mui/material";

const styles = {
   root: (theme) => ({
      background: theme.palette.secondary.light,
      color: theme.palette.common.white,
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(1),
   }),
   text: {
      padding: "0.578em",
      fontWeight: 500,
   },
};

const HighlightText = ({ text, variant = "body1" }) => {
   return (
      <Box sx={styles.root}>
         <Typography sx={styles.text} variant={variant}>
            {text}
         </Typography>
      </Box>
   );
};

HighlightText.propTypes = {
   text: PropTypes.string.isRequired,
};

export default HighlightText;
