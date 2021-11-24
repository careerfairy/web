import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";

const landingLayoutStyles = (theme) => ({
   ...nextLivestreamsLayoutStyles(theme),
   root: {
      ...nextLivestreamsLayoutStyles(theme).root,
      background: ({ bottomImage, topImage }) =>
         `url(${topImage}) top left no-repeat, url(${bottomImage}) bottom left no-repeat, ${theme.palette.common.white}`,
      backgroundSize: "auto 120vh, auto 100vh !important",
   },
});

export default landingLayoutStyles;
