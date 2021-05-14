import React, {useEffect, useState} from 'react';

const useTextOverflow = (labelRef) => {
    // Setup a ref

    // State for tracking if ellipsis is active
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);

    // Setup a use effect
    useEffect(() => {
        if (labelRef?.current?.offsetWidth < labelRef?.current?.scrollWidth) {
            setIsEllipsisActive(true);
        }
    }, [labelRef?.current]); // I was also tracking if the data was loading

    return isEllipsisActive;
}

export default useTextOverflow;