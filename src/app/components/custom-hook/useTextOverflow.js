import React, {useEffect, useRef, useState} from 'react';

/**
 * @param {*[]} dependencies
 */
const useTextOverflow = (dependencies = []) => {
    // Setup a ref
    const labelRef = useRef()

    // State for tracking if ellipsis is active
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);

    // Setup a use effect
    useEffect(() => {
        setIsEllipsisActive(Boolean(labelRef?.current?.offsetWidth < labelRef?.current?.scrollWidth));
    }, [labelRef?.current, ...dependencies]); // I was also tracking if the data was loading

    return [isEllipsisActive, labelRef];
}

export default useTextOverflow;