

// Pages import
// import QuestionFolderSelect from "../pages/QuestionFolderSelect";
// import QuestionBankSubFolderSelect from "../pages/QuestionBankSubFolderSelect";
// import QuestionManagement from "../pages/QuestionManagement";
// import QuestionBankManagement from "../pages/QuestionBankManagement";
// import ForgetPassword from "../pages/ForgetPassword";

import LoginPage from "../pages/LoginPage.jsx";
import Logout from "../pages/Logout.jsx";
import Settings from "../pages/Dashboard/DashboardPages/SettingsPage.jsx";
import ItemCategoryManagement from "../pages/Dashboard/DashboardPages/ItemCategoryManagement.jsx"
import Items from "../pages/Dashboard/DashboardPages/ItemManagement.jsx";
import AddEditItems from "../pages/Dashboard/DashboardPages/AddEditItem";
import VendorManagement from "../pages/Dashboard/DashboardPages/VendorManagement";
import ItemDetails from "../pages/Dashboard/DashboardPages/ItemDetails";

// icons import
import GearIcon from '@atlaskit/icon/glyph/settings';
import SignOutIcon from '@atlaskit/icon/glyph/sign-out';
import TrayIcon from '@atlaskit/icon/glyph/tray';
import MarketplaceIcon from '@atlaskit/icon/glyph/marketplace';

const basePath = ""
const Routes = [
  {
    pageType:"login",
    path:  basePath +  "/adminpanel",
    component: LoginPage,
  },
  {
    path:  basePath +  "/adminpanel/items/:itemid/edit-item",
    component: AddEditItems,
    pageType:"dashboard",
    viewLevel:2,
    navbarDisplayName: "Item Details",
    navbarIcon:TrayIcon
  },

  {
    path:  basePath +  "/adminpanel/items/add-item",
    component: AddEditItems,
    pageType:"dashboard",
    viewLevel:2,
    navbarDisplayName: "Item Details",
    navbarIcon:TrayIcon
  },

  {
    path:  basePath +  "/adminpanel/items/:itemid",
    component: ItemDetails,
    pageType:"dashboard",
    viewLevel:2,
    navbarDisplayName: "Item Details",
    navbarIcon:TrayIcon
  },

  {
    path:  basePath +  "/adminpanel/items",
    component: Items,
    pageType:"dashboard",
    viewLevel:1,
    navbarDisplayName: "Item Details",
    navbarIcon:TrayIcon
  },

  {
    path:  basePath +  "/adminpanel/vendors",
    component: VendorManagement,
    pageType:"dashboard",
    viewLevel:1,
    navbarDisplayName: "Vendor Management",
    navbarIcon:MarketplaceIcon
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
  {
    path:  basePath +  "/adminpanel/logout",
    component: Logout,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Logout",
    navbarIcon:SignOutIcon
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
