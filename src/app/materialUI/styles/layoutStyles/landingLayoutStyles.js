import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";
import { mainBackground } from "../../../constants/images";

const landingLayoutStyles = (theme) => ({
    ...nextLivestreamsLayoutStyles(theme),
    root: {
        ...nextLivestreamsLayoutStyles(theme).root,
        backgroundColor: theme.palette.common.white,
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto 120vh",
        // backgroundAttachment: "fixed"
    },
})

export default landingLayoutStyles