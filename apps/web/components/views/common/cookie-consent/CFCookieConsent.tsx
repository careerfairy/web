import { Button, Typography, useMediaQuery } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import Link from "next/link"
import { CSSProperties, useCallback, useMemo } from "react"
import CookieConsent from "react-cookie-consent"
import Box from "@mui/material/Box"
import { DefaultTheme } from "@mui/styles"

const styles = {
   title: {
      fontSize: "1.4rem",
      fontWeight: 500,
   },
   link: {
      textDecoration: "underline",
      color: "inherit",
   },
   desc: {},
}

const CFCookieConsent = () => {
   const theme = useTheme<DefaultTheme>()
   const mobile = useMediaQuery(theme.breakpoints.down("sm"))

   const cookieConsentStyle = useMemo(
      () =>
         ({
            zIndex: "9999",
            boxShadow: theme.shadows[5],
            background: alpha(theme.palette.common.black, 0.9),
            color: theme.palette.common.white,
            fontSize: "0.8rem",
            padding: theme.spacing(1),
            display: "flex",
            alignItems: "center",
            width: "auto",
            bottom: "0",
            right: 0,
            left: 0,
            justifyContent: "flex-end",
            ...(mobile && {
               justifyContent: "center",
               textAlign: "center",
               padding: theme.spacing(0.5),
               fontSize: "0.6rem",
            }),
         } as CSSProperties),
      [theme, mobile]
   )

   const contentStyle = useMemo(
      () =>
         ({
            flex: "0 1 auto",
            margin: theme.spacing(0.5),
         } as CSSProperties),
      [theme]
   )

   const buttonStyle = useCallback(
      (decline) => ({
         borderRadius: 10,
         padding: "1em 2em",
         background: decline
            ? theme.palette.background.default
            : theme.palette.primary.main,
         margin: theme.spacing(0.7),
         color: decline ? "grey" : theme.palette.common.white,
         ...(mobile && {
            margin: theme.spacing(0.5),
            padding: "0.7em 1.5em",
         }),
      }),
      [theme, mobile]
   )

   // disable cookie consent for tests / local environment
   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      return null
   }

   return (
      <CookieConsent
         location="bottom"
         enableDeclineButton
         buttonText="Accept All"
         flipButtons
         ButtonComponent={Button}
         contentStyle={contentStyle}
         buttonWrapperClasses={"cookie-consent-button-wrapper"}
         declineButtonText="Accept only default"
         buttonStyle={buttonStyle(false)}
         declineButtonStyle={buttonStyle(true)}
         style={cookieConsentStyle}
      >
         <Typography variant={"h6"} sx={styles.title}>
            CareerFairy uses cookies.
         </Typography>
         <Typography variant={"body2"} sx={styles.desc}>
            We use cookies to personalize content and analyze our traffic in
            order to offer you a better user experience and understand where you
            are joining us from. You cannot disable the necessary cookies that
            we need to get the website to run, but you can disable the cookies
            we use to gather statistics. You can find details about this in our{" "}
            <Link href="/privacy">
               <Box component={"a"} sx={styles.link}>
                  data protection notice
               </Box>
            </Link>
            .
         </Typography>
      </CookieConsent>
   )
}

export default CFCookieConsent
