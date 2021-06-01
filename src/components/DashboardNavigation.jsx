/** @jsx jsx */
import { Link } from 'react-router';
import Routes from "../routing/RoutesList"


import { jsx } from '@emotion/core';


import {
  ButtonItem,
  NavigationFooter,
  NavigationHeader,
  NestableNavigationContent,
  // NestingItem,
  Section,
  SideNavigation,
} from '@atlaskit/side-navigation';


const url = "http://www.thedecorshop.in"
let companyLogo = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/logo/thedecorshop-logo-transparent.png"

function checkBase(value){
  var Path = window.location.pathname.split("/")
  var basePath = (Path.slice(0,3).join("/"))
  if (value ===basePath){
    return true
  }else{
    return false
  }
}


const DashboardNavigation = () => {
  
  return (
      <SideNavigation label="project" testId="side-navigation">
        <NavigationHeader>
          <a href={url}>
            <img className="logo-side-navbar" alt="TheDecorShop" src={companyLogo} />
          </a>

        </NavigationHeader>
        <NestableNavigationContent
          initialStack={[]}
          testId="nestable-navigation-content"
        >
          <Section>
            {/* <NestingItem
              id="2"
              testId="filter-nesting-item"
              title="Filters"
              iconBefore={<FilterIcon label="" />}
            >
              <Section>
                <ButtonItem>Search issues</ButtonItem>
              </Section>
              <Section title="Starred">
                <ButtonItem>Everything me</ButtonItem>
                <ButtonItem>My open issues</ButtonItem>
                <ButtonItem>Reported by me</ButtonItem>
              </Section>
            </NestingItem>
            <ButtonItem iconBefore={<WorkIcon label="" />}>
              Your work
            </ButtonItem> */}
            {
              Routes.map((prop, key) => {
                const url = prop.path;
                const title = prop.navbarDisplayName;
                const Icon = prop.navbarIcon
                if (prop.pageType === "dashboard" && prop.viewLevel === 1) {
                  return (
                    <Link key={key} to={url}>
                      <ButtonItem iconBefore={<Icon/>} isSelected={checkBase(url)}>{title}</ButtonItem>
                    </Link>
                  );
                }else{
                  return null
                }
              }, this)
            }


          </Section>
        </NestableNavigationContent>
        <NavigationFooter>
          {/* <SampleFooter /> */}
        </NavigationFooter>
      </SideNavigation>
  );
};

export default DashboardNavigation;