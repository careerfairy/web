import { useEffect, useRef } from "react";

const AgoraStreamPlayer = ({
   stream,
   streamId,
   isScreenShareVideo,
   ...rest
}) => {
   const vidDiv = useRef(null);

   useEffect(() => {
      if (stream) {
         stream.play?.(streamId, {
            fit: isScreenShareVideo ? "contain" : "cover",
         });
         return () => {
            stream.stop();
         };
      }
   }, [stream]);

   return <div {...rest} id={streamId} ref={vidDiv} />;
};

export default AgoraStreamPlayer;
