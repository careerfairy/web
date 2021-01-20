import {isEmpty} from 'lodash/fp'
import React from "react";
import {LONG_NUMBER} from "../util/constants";

var dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime')
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

export const uploadLogo = (location, fileObject, firebase, callback) => {
    var storageRef = firebase.getStorageRef();
    let fullPath = location + '/' + fileObject.name;
    let companyLogoRef = storageRef.child(fullPath);

    var uploadTask = companyLogoRef.put(fileObject);

    uploadTask.on('state_changed',
        function (snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                default:
                    break;
            }
        }, function (error) {
            switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;

                case 'storage/canceled':
                    // User canceled the upload
                    break;

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                default:
                    break;
            }
        }, function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                callback(downloadURL, fullPath);
                console.log('File available at', downloadURL);
            });
        });
}

export const timeAgo = (date = new Date) => {
    return dayjs(date).fromNow()
}


export function getTimeFromNow(firebaseTimestamp) {
    if (firebaseTimestamp) {
        const dateString = dayjs(firebaseTimestamp.toDate()).fromNow()
        if (dateString === 'in a few seconds') {
            return 'just now';
        } else {
            return dateString
        }
    } else {
        return ""
    }
}

export const prettyDate = (firebaseTimestamp) => {
    if (firebaseTimestamp) {
        return dayjs(firebaseTimestamp.toDate()).format('LL LT')
    } else {
        return ""
    }
}

export const getLength = (arr, prop) => {
    return arr.map((el) => {
        return el?.[prop]?.length || 0
    })
}

export const isEmptyObject = (obj) => {
    return isEmpty(obj);
}

export const isServer = () => {
    return typeof window === 'undefined'
}

export const getServerSideRouterQuery = (queryKey, router) => {
    if (router.query[queryKey]) {
        return router.query[queryKey]
    } else {
        const query = router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`))
        if (query) {
            return query[1]
        } else {
            return null
        }
    }
}

export const snapShotsToData = (snapShots) => {
    let dataArray = []
    snapShots.forEach(doc => {
        const data = doc.data()
        data.id = doc.id
        dataArray.push(data)
    })
    return dataArray
}

export const singleSnapToData = (snapShot) => {
    let data = {}
    if (snapShot.exists) {
        data = snapShot.data()
        data.id = snapShot.id
    }
    return data
}

export const MultilineText = ({text}) => {
    return text.split('\\n').map((item, i) => <p key={i}>{item}</p>)
}

export const copyStringToClipboard = (string) => {
    // Create new element
    let el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = string;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}

export const mustBeNumber = (value, decimals = 2) => {
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    // checks to see if value is an int or float, if not it will return zero
    return Number.isFinite(value) ? round(value, decimals) : 0
}

export const convertStringToArray = (string, maxChars = 30) => {

// Split by spaces
    return string.split(/\s+/)

        // Then join words so that each string section is less then 40
        .reduce(function (prev, curr) {
            if (prev.length && (prev[prev.length - 1] + ' ' + curr).length <= maxChars) {
                prev[prev.length - 1] += ' ' + curr;
            } else {
                prev.push(curr);
            }
            return prev;
        }, [])
        .map(str => str)

}

export const mergeArrayOfObjects = (arr1, arr2, property) => {

    let merged = [];
    for (let i = 0; i < arr1.length; i++) {
        merged.push({
                ...arr1[i],
                ...(arr2.find((itmInner) => itmInner[property] === arr1[i][property]))
            }
        );
    }
    return merged
}

export const getMinutes = value => (value === LONG_NUMBER ? "stream Ends" : `${value} minutes`)

export const dynamicSort = (property) => {
    let sortOrder = -1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
