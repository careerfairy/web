import { styles as basicStyles } from "./basicLayoutStyles"

export const styles = {
   ...basicStyles,
   wrapper: (theme) => ({
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
      paddingTop: "64px",
      [theme.breakpoints.down("lg")]: {
         paddingLeft: 0,
      },
      [theme.breakpoints.up("lg")]: {
         paddingLeft: theme.legacy.drawerWidth.small,
      },
      [theme.breakpoints.down("sm")]: {
         paddingTop: "56px",
      },
   }),
   root: (theme) => ({
      backgroundColor: theme.palette.common.white,
      display: "flex",
      overflow: "hidden",
      width: "100%",
      flexDirection: "column",
   }),
   content: {
      ...basicStyles.content,
      overflowX: "hidden",
      display: "flex",
   },
}
