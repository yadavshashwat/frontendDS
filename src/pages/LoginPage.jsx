import PropTypes from 'prop-types';
import React, { Component } from 'react';
import '@atlaskit/css-reset';
import "../css/dashboard.css"

//do something...
import Page from '@atlaskit/page';

// Backend Connection
import { api } from "../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import authorization from "../redux/actions/authorization";

import { Grid, GridColumn } from '@atlaskit/page';
import { StatusAlertService } from 'react-status-alert'
import 'react-status-alert/dist/status-alert.css'

import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import Cookies from 'universal-cookie';
import { browserHistory  } from 'react-router';

const url="/v1/user/login";
const url_reset="/v1/user/reset_request";

class LoginPage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    }
  }

  handleEmailChange = event => {
    var data = event.target.value
    this.setState({
      email: data
    });
  };

  handlePasswordchange = event => {
    var data = event.target.value
    this.setState({
      password: data
    });
  };

  handleForgetPassword = () =>{
    const payload = {
      email:this.state.email
    }
    api(url_reset, 'post-formdata', payload)
      .then(response => {
        const { message, success} = response;   
        StatusAlertService.showAlert(message,success ? 'info': 'error',{autoHideTime:2000})     
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  }

  handleSubmit = () => {
    const eMail = this.state.email;
    const password = this.state.password;
    const cookies = new Cookies();
    // console.log(eMail,password)
    const payload = {
      email:eMail,
      password:password
    }
    api(url, 'post-formdata' ,payload)
      .then(response => {
        const { data, message, success,auth} = response;
        // console.log(result)        
        StatusAlertService.showAlert(message,success ? 'info': 'error',{autoHideTime:2000})
  
        if (success) {
            this.props.actions.loginUser({
              auth:auth,
              auth_token: data.auth_token,
              email: data.email,
              first_name: data.first_name,
              id: data.id,
              is_staff: data.is_staff,
              last_name: data.last_name,
            })
            cookies.set('auth_token', data.auth_token, { path: '/' });
            cookies.set('user_id', data.id, { path: '/' });
            cookies.set('first_name', data.first_name, { path: '/' });
            cookies.set('last_name', data.last_name, { path: '/' });
            cookies.set('email', data.email, { path: '/' });
            browserHistory.push("/adminpanel/items");
        }else{

            cookies.set('auth_token', '', { path: '/' });
            cookies.set('user_id', '', { path: '/' });
            cookies.set('first_name', '', { path: '/' });
            cookies.set('last_name', '', { path: '/' });
            cookies.set('email', '', { path: '/' });

          }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });

  }


  componentDidMount(){
    const cookies = new Cookies();
    const auth_token = cookies.get('auth_token')
    const payload={auth_token:auth_token}
    api(url, 'post-formdata' ,payload)
      .then(response => {
        const { data, success, auth} = response;
        // console.log(result)        
        if (success) {
            this.props.actions.loginUser({
              auth: auth,
              auth_token: data.auth_token,
              email: data.email,
              first_name: data.first_name,
              id: data.id,
              is_staff: data.is_staff,
              last_name: data.last_name,
            });
            browserHistory.push("/adminpanel/items");
        }
      })
      .catch(error => {
        console.log("Login Failed");
      });

  }

  render() {

      return (
        
        <div className="outer-login">
          <div className="middle-login">
          <Page>
  
            <Grid>
              <GridColumn medium={3}></GridColumn>
              <GridColumn medium={6}>
                <Grid>
                  <div className="inner-login">
                    <GridColumn medium={12}>
  
                      <div className="image-container">
                        <div className="logo-image"></div>
                      </div>
  
                    </GridColumn>
                    <GridColumn medium={12}>
                    <GridColumn medium={12}>
                      <div className="field-div">
                        <TextField autoComplete="off" value={this.state.email} placeholder="Email"  onChange={this.handleEmailChange} />
                      </div>
                    </GridColumn>
                    <GridColumn medium={12}>
                      <div className="field-div">
                        <TextField type="password" value={this.state.password} placeholder="Password" onChange={this.handlePasswordchange} />
                      </div>
                    </GridColumn>
                    <GridColumn medium={12}>
                      <div className="forget-password">
                        <span className="forget-password-message" onClick={this.handleForgetPassword}>Forgot Password?</span>
                      </div>
                    </GridColumn>
                    <GridColumn medium={12}>
                      <div className="button-row-login">
                          <div className="login-button">
                          <Button onClick={this.handleSubmit} type="submit" appearance="warning">
                            Login
                          </Button>
                          </div>
                        </div>
                    </GridColumn>  
                    </GridColumn>
                  </div>
                </Grid>
              </GridColumn>
              <GridColumn medium={3}></GridColumn>
            </Grid>
            </Page>
          </div>
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
)(LoginPage);
