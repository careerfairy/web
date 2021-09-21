import React from "react";
import { useSelector } from "react-redux";

const useHandRaiseState = () => {
   return useSelector((state) => state.firestore.data["handRaiseState"]);
};

export default useHandRaiseState;
