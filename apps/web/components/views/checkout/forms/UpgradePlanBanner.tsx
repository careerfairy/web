import { ReactNode } from "react"
import { Box, SxProps, Theme } from "@mui/material"
import { sxStyles } from "types/commonTypes"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import UpgradeSparksPlanButton from "./UpgradePlanButton"
import { Star } from "react-feather"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test public API key.
// const stripePromise = getStripe()

const styles = sxStyles({
   contentWrapper: {
      backgroundImage: "url('/star.svg')",
      backgroundPosition: "right 0px",
      backgroundRepeat: "no-repeat",
   },
   banner: {
      // mx: 5,
      my: 1,
      display: "flex",
      pl: "24px",
      alignContent: "space-between",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "150px",
      backgroundColor: "red",
      borderRadius: "12px",
      border: "1px solid var(--Attention-Attention---600---Default, #FF1616)",
      background:
         "linear-gradient(94deg, rgba(255, 0, 0, 0.10) 1.13%, rgba(255, 0, 0, 0.00) 58.83%), rgba(255, 22, 22, 0.60)",
   },
   buttonWrapper: {
      minWidth: "250px",
      height: "166px",

      // backgroundImage: "url('/star.svg')",
      // backgroundPosition: "left 0px top 0px",
      // backgroundSize: "385px, 110px, 15px",
      alignContent: "center",
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      backgroundRepeat: "no-repeat",
   },
   upgradeButton: {
      color: "white",
      backgroundColor: (theme) => theme.palette.secondary.main,
      mt: 1,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
   },
})

type Props = {
   title: ReactNode
   description: string | ReactNode
   bannerSx?: SxProps<Theme>
   show?: boolean
}
//TODO: check unmounting
/**
 * This
 * @returns
 */
const UpgradePlanBanner = ({ title, description, bannerSx, show }: Props) => {
   // const group = useGroup()
   // const [clientSecret, setClientSecret] = useState("")
   // console.log(
   //    "🚀 ~ CheckoutForm ~ clientSecret,bannerSx:",
   //    clientSecret,
   //    bannerSx
   // )

   // const redirectToCheckout = async (e: FormEvent) => {
   //    e.preventDefault()
   //    // Create a Checkout Session.
   //    const checkoutSession = await axios.post(
   //       "/api/checkout_sessions",
   //       { amount: "some amount", groupId: group.group.groupId } // BMW
   //    )

   //    if (checkoutSession.status != 200) {
   //       console.error(checkoutSession.statusText)
   //       return
   //    }
   //    console.log(
   //       "🚀 ~ redirectToCheckout ~ customerSessionSecret:",
   //       checkoutSession.data.customerSessionSecret
   //    )
   //    setClientSecret(checkoutSession.data.customerSessionSecret)

   //    // // Redirect to Checkout.
   //    // const stripe = await loadStripe()
   //    // const { error } = await stripe!.redirectToCheckout({
   //    //    // Make the id field from the Checkout Session creation API response
   //    //    // available to this file, so you can provide it as parameter here
   //    //    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
   //    //    sessionId: checkoutSession.data.id,
   //    // });
   //    // // If `redirectToCheckout` fails due to a browser or network
   //    // // error, display the localized error message to your customer
   //    // // using `error.message`.
   //    // console.warn(error.message);
   // }

   return (
      <ConditionalWrapper condition={show}>
         <Box sx={styles.contentWrapper}>
            {/* <ConditionalWrapper condition={Boolean(clientSecret)}>
               <Box></Box>
               <Box sx={styles.embeddedCheckoutWrapper}>
                  <BuyButtonComponent
                     buttonId={productConfig.buttonId}
                     publishableKey={productConfig.publishableKey}
                     clientSecret={clientSecret}
                  />
               </Box>
            </ConditionalWrapper> */}
            <Box sx={bannerSx || styles.banner}>
               <Box>
                  {title}
                  {description}
               </Box>
               <Box sx={styles.buttonWrapper}>
                  <UpgradeSparksPlanButton
                     text="Upgrade now"
                     icon={<Star strokeWidth={3} />}
                  ></UpgradeSparksPlanButton>
                  {/* <Button
                     onClick={redirectToCheckout}
                     color="secondary"
                     sx={styles.upgradeButton}
                     startIcon={<StarBorderIcon />}
                  >
                     Upgrade Now
                  </Button> */}
               </Box>
            </Box>
         </Box>
      </ConditionalWrapper>
   )
}

export default UpgradePlanBanner
