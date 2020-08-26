import React, { useEffect, useState } from 'react';
import { withFirebase } from 'context/firebase';

const UserContext = React.createContext(null);

export default UserContext;