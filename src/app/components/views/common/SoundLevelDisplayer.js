function SoundLevelDisplayer(props) {

    return (
        <div style={{ display: 'inline-block', margin: '0 auto'}}>
            <div className={'rectangle ' + (props.audioLevel > 0 ? 'green' : '')}></div>
            <div className={'rectangle small ' + (props.audioLevel > 0.05 ? 'green' : '')}></div>
            <div className={'rectangle medium ' + (props.audioLevel > 0.1 ? 'green' : '')}></div>
            <div className={'rectangle high ' + (props.audioLevel > 0.3 ? 'green' : '')}></div>
            <div className={'rectangle huge ' + (props.audioLevel > 0.8 ? 'red' : '')}></div>
            <style jsx>{`
                .rectangle {
                    display: inline-block;
                    margin: 0 20px 0 0;
                    min-height: 10px;
                    width: 8px;
                    border-radius: 3px;
                    background-color: grey;
                }

                .small {
                    height: 20px;
                }

                .medium {
                    height: 40px;
                }

                .high {
                    height: 80px;
                }

                .huge {
                    height: 140px;
                }

                .green {
                    background-color: rgb(0, 210, 170);
                }

                .red {
                    background-color: rgb(255, 0, 0);
                }
            `}</style>
        </div>
    );
}

export default SoundLevelDisplayer; 