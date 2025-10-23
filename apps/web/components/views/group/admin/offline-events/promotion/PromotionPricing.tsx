import { Box, Button, Stack, Typography } from "@mui/material"
import useStripePrice from "components/custom-hook/stripe/useStripePrice"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { BarChart2, RefreshCcw, Target, Users } from "react-feather"
import Stripe from "stripe"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"

const styles = sxStyles({
   pricingDetails: {
      width: {
         xs: "100%",
         sm: "100%",
         md: "680px",
      },
      background: "#FAFDFF",
      borderRadius: "24px",
      justifyContent: "space-between",
      alignItems: {
         xs: "flex-start",
         sm: "flex-start",
         md: "center",
      },
      p: {
         md: "24px",
         sm: "12px",
         xs: "12px",
      },
   },
   pricingCTA: {
      borderRadius: "12px",
      background: "linear-gradient(130deg, #D9DEFF 2.69%, #D8F4FF 99.29%)",
      height: "218px",
      width: {
         xs: "100%",
         sm: "100%",
         md: "306px",
      },
      p: "24px",
      alignItems: "center",
      alignContent: "center",
   },
})

export const PromotionPricing = () => {
   const isMobile = useIsMobile()

   return (
      <Stack
         sx={styles.pricingDetails}
         spacing={"12px"}
         direction={isMobile ? "column" : "row"}
      >
         <PricingCard />
         <PricingCTA />
      </Stack>
   )
}

const PricingCard = () => {
   const { data: priceData } = useStripePrice(
      process.env.NEXT_PUBLIC_OFFLINE_EVENT_PRICE_ID
   )

   const stripePrice: Stripe.Price = priceData
      ? (priceData as Stripe.Price)
      : null

   const price = stripePrice
      ? `${
           stripePrice.unit_amount / 100
        }.- ${stripePrice.currency.toUpperCase()}`
      : "400.- CHF"

   const DetailItem = ({
      icon,
      label,
   }: {
      icon: React.ElementType
      label: string
   }) => {
      return (
         <Stack
            direction={"row"}
            alignItems={"center"}
            spacing={"4px"}
            pb={"4px"}
         >
            <Box component={icon} size={14} />
            <Typography variant="small" color={"neutral.700"}>
               {label}
            </Typography>
         </Stack>
      )
   }

   return (
      <Stack spacing={2} p={"4px"}>
         <Stack>
            <Typography
               variant="brandedH3"
               fontWeight={900}
               color={"neutral.800"}
               fontStyle={"italic"}
               sx={{
                  fontSize: {
                     xs: "24px",
                     md: undefined,
                  },
               }}
            >
               Offline events
            </Typography>
            <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
               <Typography
                  variant="brandedH4"
                  fontWeight={700}
                  color={"neutral.800"}
                  fontStyle={"italic"}
                  sx={{
                     fontSize: {
                        xs: "20px",
                        md: undefined,
                     },
                  }}
               >
                  {price}
               </Typography>
               <Typography
                  fontSize={"15px"}
                  color={"neutral.800"}
                  fontStyle={"italic"}
               >
                  per event
               </Typography>
            </Stack>
         </Stack>

         <Stack>
            <DetailItem icon={Users} label="Exposure to our community" />
            <DetailItem icon={BarChart2} label="Measure your impact" />
            <DetailItem icon={RefreshCcw} label="All in one place" />
            <DetailItem icon={Target} label="Target to your preferences" />
         </Stack>
      </Stack>
   )
}

const PricingCTA = () => {
   const { handleCheckoutDialogOpen } = useOfflineEventsOverview()

   return (
      <Stack spacing={"24px"} sx={styles.pricingCTA}>
         <Typography
            width={"188px"}
            variant="brandedH4"
            fontWeight={700}
            color={"neutral.800"}
            textAlign={"center"}
         >
            Don&apos;t wait any longer
         </Typography>
         <Stack spacing={1} width={"100%"}>
            <Button
               variant="contained"
               color="secondary"
               fullWidth
               onClick={handleCheckoutDialogOpen}
            >
               Start promoting now
            </Button>
            <Button
               color="grey"
               fullWidth
               component={Link}
               href="https://library.careerfairy.io/meetings/kandeeban/offline-events"
               target="_blank"
            >
               Contact our team
            </Button>
         </Stack>
      </Stack>
   )
}
