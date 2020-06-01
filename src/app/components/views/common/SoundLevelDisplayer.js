function SoundLevelDisplayer(props) {

    return (
        <div style={{ display: 'inline-block', margin: '0 auto'}}>
            <div className={'rectangle ' + (props.audioLevel > 0 ? 'green' : '')}></div>
            <div className={'rectangle small ' + (props.audioLevel > 0.01 ? 'green' : '')}></div>
            <div className={'rectangle medium ' + (props.audioLevel > 0.025 ? 'green' : '')}></div>
            <div className={'rectangle high ' + (props.audioLevel > 0.05 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.075 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.1 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.15 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.2 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.3 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.4 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.5 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.7 ? 'red' : '')}></div>
            <style jsx>{`
                .rectangle {
                    display: inline-block;
                    margin: 0 10px 0 0;
                    min-height: 10px;
                    width: 8px;
                    border-radius: 3px;
                    background-color: grey;
                }

                .green {
                    background-color: pink;
                }

                .red {
                    background-color: rgb(255, 0, 0);
                }
            `}</style>
        </div>
    );
}

export default SoundLevelDisplayer; 