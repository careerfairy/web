import sectionStyles from "../";

export default (theme) => ({
   ...sectionStyles(theme),
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
});
