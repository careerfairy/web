function MulitLineText(props) {

    let textElements = props.text.split('//n').map((textElement, index) => {
        return(
            <div key={textElement} style={{ margin: '15px 0'}}>
                { textElement }
            </div>
        );
    })

    return (
        <div>
            { textElements }
        </div>
    );
}

export default MulitLineText; 