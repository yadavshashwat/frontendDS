
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import flag from "./flag";
import authorization from "./authorization";

// import question from './question';
// import test from './test';
// import section from "./section";
// import sectionquestion from "./sectionquestion";
// import coursetest from './coursetest';

export default combineReducers({
  routing: routerReducer,  
  flag,
  authorization,
  // sectionquestion,
  // coursetest,
  // question,
  // section,
  // test,
});
