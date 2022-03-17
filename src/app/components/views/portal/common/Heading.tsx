import React from "react";
import { Typography } from "@mui/material";
import { Theme, SxProps } from "@mui/material/styles";
const styles = {
   root: {
      color: "text.secondary",
      fontWeight: 300,
      opacity: 0.3,
   },
} as const;

const Heading = ({ sx, children }: Props) => {
   return (
      <Typography
         variant={"h5"}
         sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
      >
         {children}
      </Typography>
   );
};

interface Props {
   children: React.ReactNode;
   sx?: SxProps<Theme>;
}
export default Heading;
