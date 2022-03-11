import { alpha } from "@mui/material/styles";

export default {
   cardHovered: {
      height: "fit-content",
      transform: "translateY(-2px)",
      "& $shadow": {
         bottom: "-1.5rem",
      },
      "& $shadow2": {
         bottom: "-2.5rem",
      },
   },
   card: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "-webkit-fill-available",
      justifyContent: "space-between",
      position: "relative",
      overflow: "visible",
      borderRadius: "1.5rem",
      transition: "0.4s",
      "&:before": {
         content: '""',
         position: "absolute",
         zIndex: 0,
         display: "block",
         width: "100%",
         bottom: -1,
         height: "100%",
         borderRadius: "1.5rem",
         backgroundColor: "rgba(0,0,0,0.08)",
      },
   },
   main: {
      display: "flex",
      flex: 1,
      minHeight: "406px",
      overflow: "hidden",
      borderTopLeftRadius: "1.5rem",
      borderTopRightRadius: "1.5rem",
      zIndex: 1,
      "&:after": {
         content: '""',
         position: "absolute",
         bottom: 0,
         display: "block",
         width: "100%",
         height: "100%",
         background: (theme) =>
            `linear-gradient(to top, ${theme.palette.navyBlue.main}, rgba(0,0,0,0))`,
      },
   },
   mainBooked: {
      "&:after": {
         background: (theme) => theme.palette.primary.dark,
         opacity: 0.8,
      },
   },
   highlighted: {
      border: (theme) => `12px solid ${theme.palette.primary.main}`,
   },
   buttonsWrapper: {
      mt: 1,
      display: "flex",
      alignItems: "center",
   },
   content: {
      bottom: 0,
      width: "100%",
      zIndex: 1,
      padding: (theme) => theme.spacing(2, 2, 2),
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
   },
   avatar: {
      width: 45,
      height: 45,
   },
   groupLogo: {
      width: { xs: 60, lg: 60 },
      height: { xs: 60, lg: 60 },
      background: (theme) => theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   groupLogoStacked: {
      width: "60px",
      height: "60px",
   },
   title: {
      fontWeight: 800,
      color: (theme) => theme.palette.common.white,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: "3",
      fontSize: "1.5rem !important",
      WebkitBoxOrient: "vertical",
   },
   titleHovered: {
      WebkitLineClamp: "inherit",
   },
   author: {
      zIndex: 1,
      position: "relative",
      borderBottomLeftRadius: "1.5rem",
      borderBottomRightRadius: "1.5rem",
      bgcolor: "white",
      py: 1,
      p: 1,
      m: 0,
      flexDirection: "row",
      display: "block",
   },
   authorHovered: {
      boxShadow: (theme) => theme.shadows[3],
   },
   shadow: {
      transition: "0.2s",
      position: "absolute",
      zIndex: 0,
      width: "88%",
      height: "100%",
      bottom: 0,
      borderRadius: "1.5rem",
      backgroundColor: "rgba(0,0,0,0.06)",
      left: "50%",
      transform: "translateX(-50%)",
   },
   shadow2: {
      bottom: 0,
      width: "72%",
      backgroundColor: "rgba(0,0,0,0.04)",
   },
   previewRow: {
      width: "100%",
      mb: 1,
   },
   avaLogoWrapper: {
      flexWrap: "inherit",
      alignItems: "center",
   },
   avaLogoWrapperHovered: {
      flexWrap: "wrap",
      maxHeight: "300px",
      overflow: "auto",
      p: 1,
   },
   top: {
      zIndex: 995,
   },
   groupLogos: {
      justifyContent: "space-evenly",
      display: "flex",
      flexWrap: "wrap",
      p: 1,
   },
   livestreamCompanyAva: {
      borderBottomRightRadius: (theme) => `${theme.spacing(2.5)} !important`,
      borderTopLeftRadius: (theme) => `${theme.spacing(2.5)} !important`,
      width: "100%",
      height: "100px",
      boxShadow: (theme) => theme.shadows[5],
      background: (theme) => theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   pulseAnimate: {
      animation: `$pulse 1.2s infinite`,
   },
   "@keyframes pulse": {
      "0%": {
         MozBoxShadow: (theme) =>
            `0 0 0 0 ${alpha(theme.palette.primary.main, 1)}`,
         boxShadow: (theme) =>
            `0 0 0 0 ${alpha(theme.palette.primary.main, 1)}`,
      },
      "70%": {
         MozBoxShadow: (theme) =>
            `0 0 0 15px ${alpha(theme.palette.primary.main, 0)}`,
         boxShadow: (theme) =>
            `0 0 0 15px ${alpha(theme.palette.primary.main, 0)}`,
      },
      "100%": {
         MozBoxShadow: (theme) =>
            `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
         boxShadow: (theme) =>
            `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
      },
   },
   bookedIcon: {
      color: "white",
      position: "absolute",
      left: (theme) => theme.spacing(1),
      top: "5px",
      display: "flex",
      alignItems: "center",
   },
   bookedText: {
      marginLeft: (theme) => theme.spacing(1),
      fontWeight: "bold",
      color: (theme) => theme.palette.common.white,
   },
};
