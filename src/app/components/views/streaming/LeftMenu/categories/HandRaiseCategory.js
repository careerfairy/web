import React from "react";

import HandRaiseActive from "./hand-raise/active/HandRaiseActive";
import HandRaiseInactive from "./hand-raise/inactive/HandRaiseInactive";

function HandRaiseCategory(props) {
   return (
      <>
         <HandRaiseActive {...props} />
         <HandRaiseInactive {...props} />
      </>
   );
}

export default HandRaiseCategory;
