import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Link from "materialUI/NextNavLink";

const useStyles = makeStyles((theme) => ({
   root: {
      color: [theme.palette.common.white, "important"],
   },
}));

const LoginButton = ({}) => {
   const classes = useStyles();

   return (
      <Button
         fullWidth
         className={classes.root}
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
