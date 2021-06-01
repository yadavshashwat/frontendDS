import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Page from '@atlaskit/page';
import '@atlaskit/css-reset';

import DashboardNavigation from '../../components/DashboardNavigation';
import Cookies from 'universal-cookie';
import { browserHistory } from 'react-router';
import { api } from "../../helpers/api";
import authorization from "../../redux/actions/authorization";

// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";

const url="/v1/user/login";


class App extends Component {
  state = {

  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
  };

  static propTypes = {
    navOpenState: PropTypes.object,
    onNavResize: PropTypes.func,
  };


  componentDidMount(){
    const cookies = new Cookies();
    const auth_token = cookies.get('auth_token')
    const payload={auth_token:auth_token}
    if (!this.props.loggedIn){
      api(url, 'post-formdata' ,payload)
      .then(response => {
        const { data, success,auth} = response;
        // console.log(result)        
        if (success) {
            this.props.actions.loginUser({
              auth:auth,
              auth_token: data.auth_token,
              email: data.email,
              first_name: data.first_name,
              id: data.id,
              is_staff: data.is_staff,
              last_name: data.last_name,
            });
            console.log('loggin in try')
        }else{
          browserHistory.push("/adminpanel");
          console.log('not logged in')
        }
    });
  }     
  }

  render() {
    return (
      <div className="sidebar-app">
        <Page
          // navigationWidth={this.context.navOpenState.width}
          navigation={<DashboardNavigation/>}
        >
          {this.props.children}
        </Page>        
        
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
    actions: bindActionCreators({ ...authorization }, dispatch)
  };
}




export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);



