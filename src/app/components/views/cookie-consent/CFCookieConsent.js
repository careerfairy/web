import { Typography } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

const { default: CookieConsent } = require("react-cookie-consent")

const CFCookieConsent = ({
    hasConsented,
    setHasConsented
}) => {

    const theme = useTheme()
    const style = {
        padding: 20,
        fontSize: '1rem',
        fontWeight: 700,
        boxShadow: '0 0 2px grey'
    }
    
    return (
        <CookieConsent
            location='bottom'
            enableDeclineButton
            buttonText='Accept All'
            declineButtonText='Accept default only'
            style={style}
        >
            <Typography>This website uses some cookies.</Typography>
            <p>We use cookies to personalize content and analyze our traffic in order to offer you a better user experience and understand where our audience comes from and how it uses CareerFairy. You cannot disable the necessary cookies that we need to get the website to run, but you can disable the cookies we use to understand our audience.</p>
        </CookieConsent>
    )
}

export default CFCookieConsent;