import React from 'react';

import HandRaiseActive from './hand-raise/active/HandRaiseActive';
import HandRaiseInactive from './hand-raise/inactive/HandRaiseInactive';

function HandRaiseCategory(props) {

    return (
        <div style={{ display: (props.selectedState !== 'hand' ? 'none' : 'block')}}>
            <HandRaiseActive {...props}/>
            <HandRaiseInactive {...props}/>
        </div>
    );
}

export default HandRaiseCategory;