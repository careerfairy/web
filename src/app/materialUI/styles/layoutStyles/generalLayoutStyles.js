import nextLivestreamsLayoutStyles from "./nextLivestreamsLayoutStyles";

const generalLayoutStyles = (theme) => ({
   ...nextLivestreamsLayoutStyles(theme),
   root: {
      ...nextLivestreamsLayoutStyles(theme).root,
   },
});

export default generalLayoutStyles;
