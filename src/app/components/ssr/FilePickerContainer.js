import { window } from 'global';

function FilePickerContainer (props) {
    if (window) {
        var { FilePicker } = require('react-file-picker');
        return <FilePicker {...props}/>
    } else {
        return <div></div>;
    }
}

export default FilePickerContainer;
