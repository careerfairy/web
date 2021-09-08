import { SvgIcon } from "@material-ui/core";
import BurgerIconSVG from "public/burger_white.svg";

const BurgerIcon = (props) => {
   return (
      <SvgIcon
         color=""
         component={BurgerIconSVG}
         viewBox="0 0 600 476.6"
         {...props}
      />
   );
};

export default BurgerIcon;
