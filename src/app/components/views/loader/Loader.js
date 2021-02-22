import { CircularProgress } from '@material-ui/core';
import { Image } from 'semantic-ui-react';

const Loader = () => {
    return (
      <div className='loading-container'>
            <CircularProgress src='/loader.gif' style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} />
            <style jsx>{`
            .loading-container {
                position: absolute;
                top: 0;
                left: 0;
                background-color: white;
                height: 100%;
                width: 100%;
              }
            `}</style>
      </div>
    );
};

export default Loader;