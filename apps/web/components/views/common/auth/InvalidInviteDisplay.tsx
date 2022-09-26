import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import { Alert, AlertTitle, Typography } from "@mui/material"
import Button from "@mui/material/Button"
import Link from "../Link"
import React from "react"

type Props = {
   type: "signup" | "login"
}
const InvalidInviteDisplay = ({ type }: Props) => {
   return (
      <Container maxWidth={"sm"}>
         <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            <Stack spacing={2}>
               <Typography gutterBottom>
                  The invite you are trying to use is invalid. Please contact
                  the person who sent you the invite.
               </Typography>
               <Button
                  component={Link}
                  href={`/${type}`}
                  style={{ textDecoration: "none" }}
                  variant="outlined"
                  color="inherit"
                  size={"small"}
               >
                  Back to normal {type}
               </Button>
            </Stack>
         </Alert>
      </Container>
   )
}

export default InvalidInviteDisplay
