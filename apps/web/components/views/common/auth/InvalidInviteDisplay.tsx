import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import { Typography } from "@mui/material"
import Button from "@mui/material/Button"
import Link from "../Link"
import React from "react"

type Props = {
   type: "signup" | "login"
}
const InvalidInviteDisplay = ({ type }: Props) => {
   return (
      <Container maxWidth={"sm"}>
         <Stack spacing={2}>
            <Typography align={"center"} variant={"h3"}>
               Invalid Invite
            </Typography>
            <Typography align={"center"} variant={"body1"}>
               The invite you are trying to use is invalid. Please contact your
               the person who sent you the invite.
            </Typography>
            <Button
               fullWidth
               component={Link}
               href={`/${type}`}
               style={{ textDecoration: "none" }}
               color="primary"
               variant="contained"
            >
               Go to normal {type}
            </Button>
         </Stack>
      </Container>
   )
}

export default InvalidInviteDisplay
