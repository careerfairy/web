import { Stack, Typography } from "@mui/material"
import { WarningIcon } from "./WarningIcon"

const EmptyDataCheckerForMostSomething = () => {
   return (
      <Stack
         direction="row"
         justifyContent="center"
         alignItems="center"
         width="100%"
         height="309px"
         marginTop="-21px"
      >
         <Stack
            direction="column"
            width={{ xs: "100%", md: "34%" }}
            alignItems="center"
            textAlign="center"
            spacing={3}
         >
            <WarningIcon
               sx={{
                  fontSize: 48,
               }}
            />
            <Typography
               sx={{
                  color: "#7A7A8E",
                  fontWeight: 600,
                  fontSize: "1.425rem",
                  lineHeight: "30px",
               }}
            >
               Not enough content yet
            </Typography>
            <Typography
               sx={{
                  color: "#9999B1",
                  fontWeight: 400,
                  fontSize: "1.15rem",
                  lineHeight: "27px",
               }}
            >
               More content is needed before displaying the top performing
               Sparks from your company.
            </Typography>
         </Stack>
      </Stack>
   )
}

export default EmptyDataCheckerForMostSomething
