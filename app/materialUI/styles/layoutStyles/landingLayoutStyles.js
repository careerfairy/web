import { styles as nextLivestreamsLayoutStyles } from "./nextLivestreamsLayoutStyles"

export const styles = ({ bottomImage = "", topImage = "" }) => ({
   ...nextLivestreamsLayoutStyles,
   wrapper: (theme) => ({
      ...nextLivestreamsLayoutStyles.wrapper(theme),
      [theme.breakpoints.up("lg")]: {
         paddingLeft: 0,
      },
   }),
   root: (theme) => ({
      ...nextLivestreamsLayoutStyles.root(theme),
      background: `url(${topImage}) top left no-repeat, url(${bottomImage}) bottom left no-repeat, ${theme.palette.common.white}`,
      backgroundSize: "auto 120vh, auto 100vh !important",
   }),
})
