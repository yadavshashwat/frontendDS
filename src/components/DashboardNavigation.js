import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import Nav, {
  AkNavigationItem,
} from '@atlaskit/navigation';
import AtlassianIcon from '@atlaskit/icon/glyph/atlassian';




import Routes from "../routing/RoutesList"

let companyLogo = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/logo/thedecorshop-logo-transparent.png"
export default class StarterNavigation extends React.Component {
  state = {

  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
  };

  openDrawer = (openDrawer) => {
    this.setState({ openDrawer });
  };

  shouldComponentUpdate(nextProps, nextContext) {
    return true;
  };

  checkBase(value){
    var Path = window.location.pathname.split("/")
    var basePath = (Path.slice(0,4).join("/")) + "/"
    if (value ===basePath){
      return true
    }else{
      return false
    }
  }
  render() {
    // const globalPrimaryIcon = <AtlassianIcon label="Atlassian icon" size="xlarge" />;
    const url = "http://www.thedecorshop.in"
    
    return (
      <Nav
        isOpen={this.context.navOpenState.isOpen}
        width={this.context.navOpenState.width}
        onResize={this.props.onNavResize}
        containerHeaderComponent={() => (
          <a href={url}>
            <img className="logo-side-navbar" alt="TheDecorShop" src={companyLogo} />
          </a>
        )}
        // globalPrimaryIcon={globalPrimaryIcon}
        // globalPrimaryItemHref="/"
        // hasBlanket
      >

        {
          Routes.map((prop, key) => {
            const url = prop.path;
            const title = prop.navbarDisplayName;
            const Icon = prop.navbarIcon
            if (prop.pageType === "dashboard" && prop.viewLevel === 1) {
              return (
                <Link key={key} to={url}>
                  <AkNavigationItem
                    icon={<Icon/>}
                    text={title}
                    isSelected={this.checkBase(url)}
                  />
                </Link>
              );
            }else{
              return null
            }
          }, this)
        }
      </Nav>
    );
  }
}
