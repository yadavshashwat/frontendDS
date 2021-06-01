

// Pages import
// import QuestionFolderSelect from "../pages/QuestionFolderSelect";
// import QuestionBankSubFolderSelect from "../pages/QuestionBankSubFolderSelect";
// import QuestionManagement from "../pages/QuestionManagement";
// import QuestionBankManagement from "../pages/QuestionBankManagement";
// import Logout from "../pages/Logout";
// import ForgetPassword from "../pages/ForgetPassword";

import LoginPage from "../pages/LoginPage";
import Settings from "../pages/Dashboard/DashboardPages/SettingsPage";
import ItemCategoryManagement from "../pages/Dashboard/DashboardPages/ItemCategoryManagement"

// icons import
import GearIcon from '@atlaskit/icon/glyph/settings';
// import TrayIcon from '@atlaskit/icon/glyph/tray';
// import SignOutIcon from '@atlaskit/icon/glyph/sign-out';

const basePath = ""
const Routes = [
  {
    pageType:"login",
    path:  basePath +  "/adminpanel",
    component: LoginPage,
  },
  {
    path:  basePath +  "/adminpanel/settings",
    component: Settings,
    pageType:"dashboard",
    viewLevel:1,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/item-category-management",
    component: ItemCategoryManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },



  // {
  //   path:  basePath +  "/adminpanel/passreset/:secstring/",
  //   component: ForgetPassword,
  //   pageType:"course",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Test Usage",
  //   // navbarIcon:VidConnectionCircleIcon
  // },

  // // Question Management Paths
  // {
  //   path:  basePath +  "/adminpanel/question-folder/",
  //   component: QuestionFolderSelect,
  //   pageType:"dashboard",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Question Banks",
  //   navbarIcon:TrayIcon
  // },

  // {
  //   path:  basePath +  "/adminpanel/question-folder/:foldername/",
  //   component: QuestionBankSubFolderSelect,
  //   pageType:"dashboard",
  //   viewLevel:2,
  //   redirect:false,
  //   navbarDisplayName: "Question Banks",
  //   navbarIcon:TrayIcon
  // },


  // {
  //   path:  basePath +  "/adminpanel/question-folder/:foldername/:bankname/",
  //   component: QuestionManagement,
  //   pageType:"dashboard",
  //   viewLevel:3,
  //   redirect:false,
  //   navbarDisplayName: "Question Banks",
  //   navbarIcon:TrayIcon
  // },
  // {
  //   path:  basePath +  "/adminpanel/settings/",
  //   component: Settings,
  //   pageType:"dashboard",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Settings",
  //   navbarIcon:GearIcon
  // },
  // {
  //   path:  basePath +  "/adminpanel/settings/question-bank-management/",
  //   component: QuestionBankManagement,
  //   pageType:"dashboard",
  //   viewLevel:2,
  //   redirect:false,
  //   navbarDisplayName: "Settings",
  //   navbarIcon:GearIcon
  // },
  // {
  //   path:  basePath +  "/adminpanel/logout/",
  //   component: Logout,
  //   pageType:"dashboard",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Logout",
  //   navbarIcon:SignOutIcon
  // }
  // { redirect: true, path:  basePath +  "/adminpanel", to: "/adminpanel/home" }
];

export default Routes;
