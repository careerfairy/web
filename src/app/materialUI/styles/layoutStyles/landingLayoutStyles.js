import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";

const landingLayoutStyles = (theme) => ({
   ...nextLivestreamsLayoutStyles(theme),
   root: {
      ...nextLivestreamsLayoutStyles(theme).root,
      backgroundColor: theme.palette.common.white,
      background: ({ bottomImage, topImage }) =>
         `url(${topImage}) top left no-repeat, url(${bottomImage}) bottom left no-repeat`,
      backgroundSize: "auto 120vh, auto 100vh !important",
   },
});

export default landingLayoutStyles;
