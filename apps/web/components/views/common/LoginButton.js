import React from "react"
import Button from "@mui/material/Button"
import Link from "materialUI/NextNavLink"

const styles = {
   root: {
      color: (theme) => [theme.palette.common.white, "important"],
   },
}
const LoginButton = ({}) => {
   return (
      <Button
         fullWidth
         sx={styles.root}
         component={Link}
         href="/login"
         style={{ textDecoration: "none" }}
         color="primary"
         variant="contained"
      >
         Login
      </Button>
   )
}

export default LoginButton
