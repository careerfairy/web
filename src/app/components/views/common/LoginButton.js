import React from "react";
import { Button } from "@mui/material";
import Link from "materialUI/NextNavLink";

const LoginButton = ({}) => {
   return (
      <Button
         fullWidth
         sx={{
            color: (theme) => [theme.palette.common.white, "important"],
         }}
         component={Link}
         href="/login"
         style={{ textDecoration: "none" }}
         color="primary"
         variant="contained"
      >
         Login
      </Button>
   );
};

export default LoginButton;
