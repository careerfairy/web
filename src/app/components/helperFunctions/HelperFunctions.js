var dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime')
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