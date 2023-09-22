import React, { FC } from "react"
import Button, { ButtonProps } from "@mui/material/Button"
import Link from "./Link"
import { useRouter } from "next/router"

const styles = {
   root: {
      color: (theme) => [theme.palette.common.white, "important"],
      textDecoration: "none",
   },
}

type LinkType = typeof Link

const LoginButton: FC<Omit<ButtonProps<LinkType>, "href" | "component">> = ({
   sx,
   ...props
}) => {
   const { asPath } = useRouter()
   return (
      <Button
         fullWidth
         sx={[styles.root, ...(sx ? (Array.isArray(sx) ? sx : [sx]) : [])]}
         component={Link}
         href={`/login?absolutePath=${encodeURIComponent(asPath)}`}
         color="primary"
         variant="contained"
         {...props}
      >
         Login
      </Button>
   )
}

export default LoginButton
