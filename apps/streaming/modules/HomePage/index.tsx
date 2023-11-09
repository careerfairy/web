import { Typography, Button, Stack, Divider } from "@mui/material"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { ResponsiveButton } from "@careerfairy/shared-ui"
import { Link } from "components"

export const HomePage = () => {
   return (
      <Stack alignItems="flex-start" spacing={2} width={400}>
         <Typography variant="h1">Home Page</Typography>
         <Button component={Link} href="/test" variant="contained" size="small">
            To streaming page
         </Button>
         <Button disabled variant="contained" size="small">
            small disabled button
         </Button>
         <Button variant="contained" size="medium">
            medium button
         </Button>
         <Button variant="contained" color="secondary" size="large">
            large button
         </Button>
         <Divider />
         <ResponsiveButton variant="contained" startIcon={<CheckRoundedIcon />}>
            responsive button
         </ResponsiveButton>
         <Button
            startIcon={<CheckRoundedIcon />}
            variant="contained"
            size="small"
         >
            small button
         </Button>
         <Button
            startIcon={<CheckRoundedIcon />}
            variant="contained"
            size="medium"
         >
            medium button
         </Button>
         <Button
            startIcon={<CheckRoundedIcon />}
            variant="contained"
            color="secondary"
            size="large"
         >
            large button
         </Button>
      </Stack>
   )
}
