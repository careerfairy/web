import { window } from 'global';

function FilePickerContainer (props) {
    if (window) {
        var { FilePicker } = require('react-file-picker');
        return <FilePicker {...props}/>
    } else {
        return ( 
            <div>
                <input type='file' style={{ display: 'none' }}/>
                <button className='ui primary button'><i aria-hidden='true' className='upload icon'/>Upload Slides [.pdf]</button>
            </div>
        );
    }
}

export default FilePickerContainer;
