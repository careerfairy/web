export const styles = {
   root: (theme) => ({
      backgroundColor: theme.palette.background.dark,
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      width: "100%",
   }),
   wrapper: (theme) => ({
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
      paddingTop: "64px",
      [theme.breakpoints.up("lg")]: {
         paddingLeft: "256px",
      },
      [theme.breakpoints.down("sm")]: {
         paddingTop: "56px",
      },
   }),
   contentContainer: {
      display: "flex",
      flex: "1 1 auto",
      overflow: "hidden",
   },
   content: {
      flex: "1 1 auto",
      height: "100%",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
   },
}
