
import React, { Component } from 'react';


import { browserHistory } from 'react-router';
//do something...

import { StatusAlertService } from 'react-status-alert'
import 'react-status-alert/dist/status-alert.css'
// Backend Connection
import { api } from "../helpers/api";
// Redux 
import { connect } from "react-redux";
import Cookies from 'universal-cookie';

// Redux dispatch
import { bindActionCreators } from "redux";
import authorization from "../redux/actions/authorization";

const url="/v1/user/logout";

class Logout extends Component {
  
  componentDidMount(){
    const cookies = new Cookies();
    const payload = {user_id:this.props.userId};
    
    api(url,'post-formdata' ,payload)
    .then(response => {
      const { message, success} = response;
      StatusAlertService.showAlert(message,success ? 'info': 'error',{autoHideTime:1000})

      // console.log(result)        
      if (success) {
          this.props.actions.logoutUser({});
          cookies.set('auth_token', '', { path: '/' });
          cookies.set('user_id', '', { path: '/' });
          browserHistory.push("/adminpanel");
      }

  });
}

  render() {
    return (
        <div>

        </div>    
      );
  }
}


function mapStateToProps(store) {
  return {
    ...store.authorization
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ 
      ...authorization
    }, dispatch)
  };
}




export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Logout);
