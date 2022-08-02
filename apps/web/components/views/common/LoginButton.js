import React from "react"
import Button from "@mui/material/Button"
import Link from "./Link"
import { useRouter } from "next/router"

const styles = {
   root: {
      color: (theme) => [theme.palette.common.white, "important"],
   },
}
const LoginButton = ({}) => {
   const { asPath } = useRouter()
   return (
      <Button
         fullWidth
         sx={styles.root}
         component={Link}
         href={`/login?absolutePath=${asPath}`}
         style={{ textDecoration: "none" }}
         color="primary"
         variant="contained"
      >
         Login
      </Button>
   )
}

export default LoginButton
