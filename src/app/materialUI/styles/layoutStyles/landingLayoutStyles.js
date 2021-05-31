import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";

const landingLayoutStyles = (theme) => ({
    ...nextLivestreamsLayoutStyles(theme),
    root: {
        ...nextLivestreamsLayoutStyles(theme).root,
        backgroundColor: theme.palette.common.white,
    },
})

export default landingLayoutStyles