import { styled } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";

const SectionContainer = styled(Container)({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
});

export default SectionContainer;
