import { styles as nextLivestreamStyles } from "./nextLivestreamsLayoutStyles";

export const styles = {
   ...nextLivestreamStyles,
   root: (theme) => ({
      ...nextLivestreamStyles.root(theme),
   }),
};
