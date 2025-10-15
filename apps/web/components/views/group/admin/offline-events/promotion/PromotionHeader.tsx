import { Stack, Typography } from "@mui/material"
import { PromotionPricing } from "./PromotionPricing"

const HEADER_TITLE = "Bring your campus events to the right students"
const HEADER_SUBTITLE =
   "Get your events in front of students where they already are. Reach by university, field of study, and track engagement in real time."

export const PromotionHeader = () => {
   return (
      <Stack spacing={4} alignItems={"center"}>
         <Stack spacing={0}>
            <Typography
               variant="brandedH3"
               fontWeight={700}
               color={"neutral.800"}
               textAlign="center"
               sx={{
                  fontSize: {
                     xs: "24px",
                     md: undefined,
                  },
               }}
            >
               {HEADER_TITLE}
            </Typography>
            <Typography
               variant="medium"
               color={"neutral.700"}
               textAlign={"center"}
               sx={{ maxWidth: "560px" }}
            >
               {HEADER_SUBTITLE}
            </Typography>
         </Stack>
         <PromotionPricing />
      </Stack>
   )
}
