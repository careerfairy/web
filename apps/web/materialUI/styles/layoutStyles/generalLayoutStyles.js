import { styles as nextLivestreamStyles } from "./nextLivestreamsLayoutStyles"

export const styles = {
   ...nextLivestreamStyles,
   root: (theme) => ({
      ...nextLivestreamStyles.root(theme),
   }),
   wrapper: (theme) => ({
      ...nextLivestreamStyles.wrapper(theme),
      [theme.breakpoints.up("lg")]: {
         paddingLeft: 0,
      },
   }),
}
