import React from "react";
import StreamItem from "./StreamItem";


const LocalStreamItem = ({ stream, big, speaker}) => {

   return <StreamItem speaker={speaker} stream={stream} big={big} />;
};

export default LocalStreamItem;
