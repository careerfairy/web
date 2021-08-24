import { Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Link from "next/link";
import { useCallback } from "react";
import CookieConsent from "react-cookie-consent"

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '1.4rem',
        fontWeight: 500
    },
    link: {
        textDecoration: 'underline',
        color: 'inherit',
    }
}));

const CFCookieConsent = () => {

    const theme = useTheme()
    const classes = useStyles()

    const cookieConsentStyle = {
        zIndex: '9999',
        background: theme.palette.navyBlue.main, 
        color: theme.palette.common.white,
        // padding: '50px 30px',
        boxShadow: theme.shadows[10],
        alignItems: 'center',
    }

    const buttonStyle = useCallback((decline) => {
        return {
            borderRadius: 10,
            padding: 15,
            fontWeight: 500,
            fontFamily: 'Poppins',
            background: decline ? theme.palette.background.default : theme.palette.primary.main,
            color: decline ? 'grey' : theme.palette.common.white,
            margin: 15
        }
    },[theme])
    
    return (
        <CookieConsent
            location='bottom'
            enableDeclineButton
            buttonText='Accept All'
            flipButtons
            declineButtonText='Accept only default'
            buttonStyle={buttonStyle(false)}
            declineButtonStyle={buttonStyle(true)}
            style={cookieConsentStyle}
        >
            <Typography className={classes.title}>CareerFairy uses cookies.</Typography>
            <p>We use cookies to personalize content and analyze our traffic in order to offer you a better user experience and understand where you are joining us from. You cannot disable the necessary cookies that we need to get the website to run, but you can disable the cookies we use to gather statistics. You can find details about this in our <Link href='/privacy'><a className={classes.link}>data protection notice</a></Link>.</p>
        </CookieConsent>
    )
}

export default CFCookieConsent;