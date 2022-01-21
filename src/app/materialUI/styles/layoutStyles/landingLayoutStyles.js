import { styles as nextLivestreamsLayoutStyles } from "./nextLivestreamsLayoutStyles";

export const styles = ({ bottomImage = "", topImage = "" }) => ({
   ...nextLivestreamsLayoutStyles,
   root: (theme) => ({
      ...nextLivestreamsLayoutStyles.root(theme),
      background: `url(${topImage}) top left no-repeat, url(${bottomImage}) bottom left no-repeat, ${theme.palette.common.white}`,
      backgroundSize: "auto 120vh, auto 100vh !important",
   }),
});
