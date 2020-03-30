function ReactMicContainer (props) {
    if (window) {
        var { ReactMic } = require('react-mic');
        return <ReactMic {...props}/>
    } else {
        return <div></div>;
    }
}

export default ReactMicContainer;
