import React, { useCallback, useState } from "react";


const useSliderFullyOpened = () => {

  const [fullyOpened, setFullyOpened] = useState(false);
  const onEntered = useCallback( () => setFullyOpened(true),[])
  const onExited = useCallback(() => setFullyOpened(false),[]);

  return [fullyOpened, onEntered, onExited]
};

export default useSliderFullyOpened;
