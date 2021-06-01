import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";
import { mainBackground } from "../../../constants/images";

const landingLayoutStyles = (theme) => ({
    ...nextLivestreamsLayoutStyles(theme),
    root: {
        ...nextLivestreamsLayoutStyles(theme).root,
        backgroundColor: theme.palette.common.white,
        background: `url(${mainBackground})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto 150vh"
    },
})

export default landingLayoutStyles