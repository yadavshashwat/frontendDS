
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import authorization from "./authorization";


export default combineReducers({
  routing: routerReducer,  
  authorization
});
