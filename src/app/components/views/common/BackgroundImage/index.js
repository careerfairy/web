import PropTypes from "prop-types";
import React from "react";
import { Box } from "@mui/material";

const styles = {
   root: (theme, { image, opacity, imagePosition, repeat }) => ({
      backgroundImage: `url(${image})`,
      opacity: opacity,
      backgroundPosition: imagePosition,
      backgroundSize: "cover",
      top: "0",
      left: "0",
      bottom: "0",
      right: "0",
      position: "absolute",
      ...(repeat && {
         backgroundSize: "auto",
         backgroundPosition: "0% 0%",
         backgroundRepeat: "true",
      }),
   }),
};

const BackgroundImage = ({
   image,
   opacity,
   repeat,
   className,
   imagePosition = "center center",
}) => {
   return (
      <Box
         className={className}
         sx={(theme) =>
            styles.root(theme, { image, opacity, imagePosition, repeat })
         }
      />
   );
};

export default BackgroundImage;

BackgroundImage.propTypes = {
   image: PropTypes.string,
   opacity: PropTypes.number,
   repeat: PropTypes.bool,
};
