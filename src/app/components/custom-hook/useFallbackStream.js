import React from 'react';
import {useRouter} from "next/router";


/**
 * @param {(null | Object)} localMediaStream - The employee who is responsible for the project.
 * @param {string} localMediaStream.streamId - The name of the employee.
 * @param {Object[]} externalMediaStreams - An Array of external stream Objects
 * @returns {{}} Returns the 3 stream link types
 */
const useFallbackStream = (localMediaStream, externalMediaStreams) => {

    const {query:{}} = useRouter()

    return {};
}

export default useFallbackStream;