// React
import React, { Component } from 'react';
import { Link } from 'react-router';


// Components
import ContentWrapper from '../../../components/ContentWrapper';

// Atlaskit Packages
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';

// Styles
import "../../../css/dashboard.css"

// Icons
import MediaServicesBlurIcon from '@atlaskit/icon/glyph/media-services/blur';
import pathIcon from "../../../routing/BreadCrumbIcons"

// Other
var changeCase = require("change-case");

export default class StaffPage extends Component {
  render() {
    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    breadCrumbElement = Path.map((row, index) => {
      if (index > 1 && index < (Path.length)){
        var textPath = changeCase.titleCase(Path[index])
        var link =  (Path.slice(0,index + 1).join("/"))
        try{
          return (<BreadcrumbsItem key={index} iconBefore={pathIcon[Path[index]]} href={link} text={textPath} />);
        }
        catch(err){
          return (<BreadcrumbsItem key={index} href={link} text={textPath} />);
        }

      } else {
        return null;
      }
      
    });  

    
    return (
      <ContentWrapper>
      <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid layout="fluid">
          <GridColumn medium={12} className="folder-grid">
            <Link to="/adminpanel/settings/item-category-management">
              <div className="settings-div">
                <div className="folder-icon-container-settings">
                  <MediaServicesBlurIcon className="folder-icon" />
                </div>
                <div className="folder-name">
                  Item Category Management
                </div>
              </div>
            </Link>
          </GridColumn>

        </Grid>
      </ContentWrapper>
    );
  }
}
