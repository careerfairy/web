import React, {useState, useEffect, Fragment} from 'react';

import { withFirebase } from 'context/firebase';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import UserContext from 'context/user/UserContext';
import HandRaiseActive from './hand-raise/active/HandRaiseActive';
import HandRaiseInactive from './hand-raise/inactive/HandRaiseInactive';

function HandRaiseCategory(props) {

    if (props.selectedState !== 'hand') {
        return null;
    }

    return (
        <div>
            <HandRaiseActive livestream={props.livestream}/>
            <HandRaiseInactive livestream={props.livestream}/>
        </div>
    );
}

export default withFirebase(HandRaiseCategory);