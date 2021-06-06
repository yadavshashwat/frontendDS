// React
import React, { Component } from 'react';
import { Link } from 'react-router';

// Styles
import "../../../css/dashboard.css"

// Backend Connection
import { api } from "../../../helpers/api.jsx";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../../redux/actions/flag";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
// import DynamicTable from '@atlaskit/dynamic-table';
import SearchIcon from "@atlaskit/icon/glyph/search";
import { CreatableSelect } from '@atlaskit/select';
import Lozenge from '@atlaskit/lozenge';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextArea from '@atlaskit/textarea';


//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../../../routing/BreadCrumbIcons"
import FolderIcon from '@atlaskit/icon/glyph/folder';
import EditorEditIcon from '@atlaskit/icon/glyph/editor/edit';
import TrashIcon from '@atlaskit/icon/glyph/trash';
// Components
// import ContentWrapper from '../../../components/ContentWrapper';
import ItemsPage from "../DashboardPages/ItemManagement"
// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import ContentLoader from "react-content-loader";
var changeCase = require("change-case");

const loaderArray = [1,2,3]
const random = Math.random() * (1 - 0.7) + 0.9;

const MyTextLoader = () => (
  <ContentLoader
    speed={2}
    primaryColor="#f3f3f3"
    secondaryColor="#ecebeb"
    className="contentLoaderStyle"
  >
    <rect x="0" y="15" rx="5" ry="5" width={100 * random} height="15" />
    <rect x="0" y="45" rx="5" ry="5" width={200 * random} height="15" />
  </ContentLoader>
);

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}



// api url path
var url_vendor = "/v1/vendors/";
var url_vendoritem = "/v1/vendoritems/";
var url_vendoritempair = "/v1/vendoritemspair/";
var url_vendoritempair_post = "/v1/vendoritemspair";
const loaderURL = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/loading-gifs/deadpool.gif"
// var noImagePath = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/other/nothing_image_new.png";
var noImagePath = "";
const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]



const deleteConfMessage = "Are you sure you want to delete the vendor Item? Please note that this will not delete any items but will remove vendor from the given item."
const deleteConfHeader = "Confirm Vendor Item Removal"

class ItemCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      dataItems: [],
      dataCompare:[],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':20,'label':'20 Items/Page'},
      
      
      // filter variables
      sortByOptions: [],
      orderByOptions: [],
      categoryOptions: [],
      categoryValue: [],
      statusOptions: [],
      statusValue: [],
      searchIcon: true,
      statusValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      
      // Modal variables

      isModalOpen: false,
      submitError: "",
      isNew: true,
      activeDataId: "",
      isConfModalOpen:false,

    };
  }

  hideSearchIcon = () => {
    this.setState({ searchIcon: false });
  };

  showSearchIcon = event => {
    if (event.target.value === "") {
      this.setState({ searchIcon: true });
    }
  };


  applyFilter = obj => {
    this.setState({ loaded: false });
    let payloadData = {
      sort_by: this.state.sortValue ? this.state.sortValue.value : "",
      order: this.state.orderBy,
      search: this.state.searchValue,
      page_num: 1,
      page_size: this.state.pageSize.value,
      category: (this.state.categoryValue).map(x => x['value']).join(","),
      status: (this.state.statusValue).map(x => x['value']).join(",")
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url_vendoritem + this.state.data.id ,'get', payload)
      .then(response => {
        const { data, success, num_pages } = response;
        if (success) {
          this.setState({
            dataItems: data,
            loaded: true,
            numPages: num_pages,
          });

        }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  };

  // Filters Handling
  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }

  handlePageClick = data => {
    let selected = data.selected;
    this.setState({ pageNum: selected + 1 }, () => {
      this.applyFilter({ page_num: selected + 1 });
    });

  };

  handleSortChange = value => {
    this.setState({ sortValue: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value: "" , page_num: 1 });
    });
  };

  handleCategoryChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ categoryValue: value, pageNum: 1 }, () => {
      this.applyFilter({ category: data, page_num: 1 });
    });
  };

  toggleOrderBy = () => {
    let orderBy = this.state.orderBy;
    let toggle = orderBy === "asc" ? "desc" : "asc";
    this.setState({ orderBy: toggle });
    if (this.state.sortValue !== "") {
      this.setState({ pageNum: 1 }, () => {
        this.applyFilter({ order_by: toggle, page_num: 1 });
      });
    }
  };


  handleSearchChange = event => {
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }


  handleConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    this.setState({
      isConfModalOpen:true,
      activeDataId: parseInt(dataId,10)
    })
  }


  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen:false,
      activeDataId:""
    })
  }

  handleEditorIconClick = event => {
    const dataId = event.currentTarget.dataset.id;
    const dataList = this.state.dataItems;
    const index = dataList.findIndex(x => x.id === parseInt(dataId,10));
    console.log(index,dataList,dataId)
    var costPrice = this.state.dataItems[index]['cost_price']
    this.setState({
      activeDataId: parseInt(dataId,10),
      costPriceValue: costPrice,
      costUpdateModal:true
    })
  }

  handleCostModalClose = () => {
    this.setState({
      activeDataId: "",
      costPriceValue: "",
      costUpdateModal:false
    })
  }

  handleCostPriceChange = event => {
    var data = event.target.value
      // this.setState({
      //   costPriceValue: data,
      // });
   
    if (data >= 0) {
      this.setState({
        costPriceValue: data,
      });
    } else {
      this.setState({
        costPriceValue: "",
      });
    }
  };

  handleCostUpdate = () => {
    const dataId = this.state.activeDataId
    const dataList = this.state.dataItems;
    const index = dataList.findIndex(x => x.id === parseInt(dataId));

    // console.log(index)
    const payload = {
      'vendor': this.state.data.id,
      'item':dataList[index].item_details.id,
      'cost_price':this.state.costPriceValue
    }
    api(url_vendoritempair  + dataId, 'put',payload).then(response => {
      const { data, message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          dataItems: [
            ...this.state.dataItems.slice(0, index),
            data,
            ...this.state.dataItems.slice(index + 1)
          ],
          loaded: true,    
          activeDataId:"",
          costUpdateModal:false
        });
      }
    });

  }


  handleDelete = () => {
    const dataId = this.state.activeDataId
    const dataList = this.state.dataItems;
    const index = dataList.findIndex(x => x.id === parseInt(dataId));

    const dataList2 = this.state.dataCompare;
    const index2 = dataList2.findIndex(x => x.id === parseInt(dataId));

    console.log(index)
    api(url_vendoritempair + dataId, 'delete',{}).then(response => {
      const { message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          dataItems: [
            ...this.state.dataItems.slice(0, index),
            ...this.state.dataItems.slice(index + 1)
          ],
          dataCompare: [
            ...this.state.dataCompare.slice(0, index2),
            ...this.state.dataCompare.slice(index2 + 1)
          ],


          loaded: true,    
        });
        this.handleConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
    });
  }

  handleAddItem = event => {
    const dataId = event.currentTarget.dataset.id;
    const payload = {
      'vendor': this.state.data.id,
      'item':dataId,
      'cost_price':""
    }

    api(url_vendoritempair_post, 'post',payload).then(response => {
      const { data, message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          dataItems: [
            ...this.state.dataItems,
            data,
          ],
          dataCompare: [
            ...this.state.dataCompare,
            data,
          ],
          loaded: true,    
        });
      }else{
        this.setState({
          loaded:true
        })
      }
    });
  }

  // handleEditModalOpen = event => {
  //   const data_id = event.currentTarget.dataset.id
  //   this.setState({ isNew: false, activeDataId: parseInt(data_id,10) });

  //   api(url + '/' + data_id,'get', {}).then(response => {
  //     const { data, success } = response;
  //     if (success) {
  //       this.setState(
  //         {
  //           modalData: data,
  //         }, () => {
  //           this.setState({ isModalOpen: true });
  //         });
  //     }
  //   });
  // }


  handleAddModalOpen = () => {
    this.setState({
      isModalOpen: true,
    });
  }

  handleModalClose = () => {
    this.setState({
      isModalOpen: false,
    });
  }


  handleStatusChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ statusValue: value, pageNum: 1 }, () => {
      this.applyFilter({ status: data, page_num: 1 });
    });
  };

  
  // submitData = data => {
  //   var submit = true
  //   const dataList = this.state.data;
  //   const index = dataList.findIndex(x => x.id === this.state.activeDataId);
  //   console.log(index)
  //   const categoryList = this.state.categoryOptions;
  //   const indexCat = categoryList.findIndex(x => x.value === data.category.value);
  //   console.log(indexCat)
  //   // console.log(index)
  //   if (submit) {
  //     this.setState({ loaded: false });
  //     if (this.state.isNew) {
  //       api(url, 'post' ,{
  //         category: data.category.value,
  //         sub_category: data.sub_category,
  //         description: data.description
  //       }).then(response => {
  //         const { data, message, success } = response;
  //         this.props.actions.addFlag({
  //           message: message,
  //           appearance: (success ? "warning" :  "danger")
  //         });    
  //         if (success){
  //           if (indexCat === -1){
  //             this.setState({
  //               categoryOptions:[{'value':data.category,'label':changeCase.titleCase(data.category)},...this.state.categoryOptions]
  //             })
  //           }            
  //           this.setState({
  //             data: [data, ...this.state.data],
  //             loaded: true
  //           });
  //           this.handleModalClose();  
  //         }else{
  //           this.setState({
  //             loaded:true
  //           })
  //         }
  //       });
  //     }else{
  //       api(url + '/' + this.state.activeDataId,'put', {
  //         category: data.category.value,
  //         sub_category: data.sub_category,
  //         description: data.description,
  //       }).then(response => {
  //         const { data, message, success } = response;
  //         this.props.actions.addFlag({
  //           message: message,
  //           appearance: (success ? "warning" :  "danger")
  //         });    
  //         if (success){
  //           if (indexCat === -1){
  //             this.setState({
  //               categoryOptions:[{'value':data.category,'label':changeCase.titleCase(data.category)},...this.state.categoryOptions]
  //             })
  //           }
  //           this.setState({            
  //             data: [
  //               ...this.state.data.slice(0, index),
  //                 data,
  //               ...this.state.data.slice(index + 1)
  //             ],
  //             loaded: true,            
  //           });
  //           this.handleModalClose();
  //         }else{
  //           this.setState({
  //             loaded:true
  //           })
  //         }
  //       });
  //     }
  //   }
  // }


  // On Load
  componentDidMount() {
    var Path = window.location.pathname.split("/")
    var textPath = null;
    textPath = decodeURIComponent(Path[3])
    console.log(textPath)

    // let filtersData =  {  page_num: this.state.pageNum, page_size: this.state.pageSize.value }
    let filtersData =  {  is_all: "1" }

    api(url_vendor + textPath, 'get', {}).then(response => {
      const { data,  message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });
      if (success) {
        this.setState(
          {
            data: data
          }
        );

        api(url_vendoritem + textPath, 'get', filtersData).then(response => {
          const { data, filters, message, success, num_pages } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });
          if (success) {
            this.setState(
              {
                dataItems: data,
                dataCompare:data,
                loaded: true,
                numPages: num_pages,
                sortByOptions: JSON.parse(JSON.stringify(filters.sort_by)),
                orderByOptions: JSON.parse(JSON.stringify(filters.order_by)),
                categoryOptions: JSON.parse(JSON.stringify(filters.category)),
                statusOptions: JSON.parse(JSON.stringify(filters.status)),
              }
            );
          }
        });
    
      }
    });

  }


  render() {
    // const caption = "User Lists";
    const SearchIconContainer = styled.div`
      position: absolute;
      top: 49px;
      left: 20px;
    `;

    const SortIconContainer = styled.div`
      margin-top:46px;
      cursor:pointer
  `  ;


    let renderBodyElement = null;
    if (this.state.loaded === true) {
      renderBodyElement = null;
      renderBodyElement = this.state.dataItems.map((row, key) => {
        return (
                <GridColumn key = {key} medium={2} className="item-grid">
                  
                      <div className="item-div-vendor">
                        <div className="item-div-internal-vendor">
                        <div className="item-remove-button" data-id={row.id} onClick={this.handleConfModalOpen.bind(this)} >
                          <div className="item-remove-icon-container">
                            <TrashIcon size={'medium'} ></TrashIcon>
                          </div>
                        </div>
                        <Link to={"/adminpanel/items/" + row.item_details.id}>
                          <div className="item-image-container-vendor">
                            <img className="item-image" src={row.item_details.image_details.length > 0 ? row.item_details.image_details[row.item_details.image_details.findIndex(x => x.is_primary === true) > 0 ? row.item_details.image_details.findIndex(x => x.is_primary === true) : 0].path : noImagePath}/>
                          </div>
                          <div className="item-name-vendor">
                            {changeCase.titleCase(row.item_details.name)} 
                            <br></br>
                            {row.item_details.category_details && (
                              <div className="category-pill">{row.item_details.category_details ? titleCase(row.item_details.category_details.category + " - " + row.item_details.category_details.sub_category): ""}</div>
                            )}
                          </div>
                        </Link>
                          <div className="cost-price-container-vendor">
                            <div className="cost-price">
                                {"₹ " + row.cost_price}
                            </div>
                            <div data-id={row.id} onClick={this.handleEditorIconClick.bind(this)} className="cost-price-icon">
                              <EditorEditIcon />
                            </div>
                          </div>
                        </div>  
                        
                    </div>
                    
                </GridColumn>
        );
      });
    } else {
      renderBodyElement = loaderArray.map((row, key) => {
        return (
                <GridColumn key={key} medium={2} className="item-grid">
                      <div className="item-div">
                        <div className="item-div-internal">
                          <div className="item-image-container">
                          </div>
                          <div className="item-name">
                            <MyTextLoader/>
                          </div>
                        </div>  
                    </div>

                </GridColumn>
        );
      });
    }
  



    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    breadCrumbElement = Path.map((row, index) => {
      if (index > 1 && index < (Path.length)){
        var textPath = ""
        if (index == 3){
          var textPath = this.state.data ? changeCase.titleCase(this.state.data.company_name) : ""
        }else{
          var textPath = changeCase.titleCase(Path[index])
        }
        var link =  (Path.slice(0,index + 1).join("/"))
        // console.log(index,textPath, link)
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
    let orderByIcon = <SortIconContainer><ArrowUpCircleIcon></ArrowUpCircleIcon></SortIconContainer>
    if (this.state.orderBy === "asc") {
      orderByIcon = <SortIconContainer><ArrowUpCircleIcon onClick={this.toggleOrderBy} className="sortIcon"></ArrowUpCircleIcon></SortIconContainer>
    } else {
      orderByIcon = <SortIconContainer><ArrowDownCircleIcon onClick={this.toggleOrderBy} className="sortIcon"></ArrowDownCircleIcon></SortIconContainer>
    }
    return (
      <div>
                {(!this.state.loaded)  && (
          <div className="overlay-loader">
            <div className="loader-container">
                <img className="loader-image" src={loaderURL}></img>
            </div>
          </div>
        )}

        <div className="dashboard-page">
        <Grid layout="fluid">
                <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        </Grid>
        <Grid layout="fluid">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
            
              <Button  appearance="warning">
              Edit Vendor
              </Button>
            
          </GridColumn>
        </Grid>
        <Grid layout="fluid">
          <h2>Vendor Details</h2>
        </Grid>
        {/* <br></br> */}
        <hr></hr>
        <Grid layout="fluid">
          <GridColumn medium={12}>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Company Name</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.company_name ? titleCase(this.state.data.company_name) : ""}</span></GridColumn>
                <GridColumn medium={2}><span className="item-details-text"><b>Email</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.email ? this.state.data.email : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Owner Name</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.owner_name ? titleCase(this.state.data.owner_name) : ""}</span></GridColumn>
                <GridColumn medium={2}><span className="item-details-text"><b>Owner Number</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.owner_phone ? (this.state.data.owner_phone) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Alt. Name</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.contact_name ? titleCase(this.state.data.contact_name) : ""}</span></GridColumn>
                <GridColumn medium={2}><span className="item-details-text"><b>Alt.  Phone</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.contact_phone ? (this.state.data.contact_phone) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Address</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.address ? titleCase(this.state.data.address + ", "+ this.state.data.city + ", "+ this.state.data.state + ", "+ this.state.data.pincode) : ""}</span></GridColumn>
                <GridColumn medium={2}><span className="item-details-text"><b>Source</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.source ? titleCase(this.state.data.source) : ""}</span></GridColumn>
              </Grid>
          </GridColumn>
        </Grid>
        <br></br>
        <br></br>
        <Grid layout="fluid">
          <h2>Listed Items</h2>
        </Grid>
        {/* <br></br> */}
        <hr></hr>
        <Grid layout="fluid">
          <GridColumn medium={8}></GridColumn>
          <GridColumn medium={4}>
            <div className="item-vendor-button-row">
            <div className="item-add-button-vendor">
            <Button onClick={this,this.handleAddModalOpen} appearance="warning">
              Add Existing Item
            </Button>
            </div>
            <div className="item-add-button-vendor">
            <Link to={'/adminpanel/vendors/'+this.state.data.id + '/add-item'}>
              <Button appearance="warning">
                Add New Item
              </Button>
            </Link>
          </div>
          </div>
          </GridColumn>
        </Grid>

        <Grid layout="fluid">
          <GridColumn medium={2}>
            <div className="field-div">
              {this.state.searchIcon === true && (
                <SearchIconContainer>
                  <SearchIcon />
                </SearchIconContainer>
              )}
              <span className="field-label">Search</span>
              <TextField
                onFocus={this.hideSearchIcon}
                onBlur={this.showSearchIcon}
                onChange={this.handleSearchChange}
                value={this.state.searchValue}
                appearance="standard"
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Category</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.categoryOptions}
                placeholder="Categories"
                onChange={this.handleCategoryChange}
                value={this.state.categoryValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Status</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="sele"
                options={this.state.statusOptions}
                placeholder="Status"
                onChange={this.handleStatusChange}
                value={this.state.statusValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Sort</span>
              <Select
                isClearable
                className="single-select"
                classNamePrefix="react-select"
                options={this.state.sortByOptions}
                placeholder="Sort By"
                value={this.state.sortValue}
                onChange={this.handleSortChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={1}>
            {orderByIcon}
          </GridColumn>
        </Grid>
        <Grid layout="fluid">
          {renderBodyElement}  
        </Grid>            
        {/* <Grid layout="fluid">
          <GridColumn medium={10}>
          {(this.state.loaded && this.state.numPages > 1) && (
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={this.state.numPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={this.handlePageClick}
            containerClassName={'pagination'}
            previousClassName={'pagination-next'}
            nextClassName={'pagination-next'}
            subContainerClassName={'pages-pagination'}
            activeClassName={'active'}
            forcePage={this.state.pageNum - 1}
          />
          )}
          </GridColumn>
          <GridColumn medium={2}>            
          <div className="field-div-pagination">
          <Select
            name="numItems"
            options={itemOptions}
            // placeholder="4,5,6..."
            onChange={this.handleNumItemsChange}
            value={this.state.pageSize}
          />
          </div>
          </GridColumn>
        </Grid>  
           */}
        <ModalTransition>
          {this.state.isConfModalOpen && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Confirmed', appearance: 'warning', onClick: this.handleDelete },
                { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose },
              ]
            } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                {deleteConfMessage}              
            </Modal>

          )}
        </ModalTransition>
        <ModalTransition>
          {this.state.costUpdateModal && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Update', appearance: 'warning', onClick: this.handleCostUpdate },
                { text: 'Close', appearance: 'normal', onClick: this.handleCostModalClose },
              ]
            } onClose={this.handleCostModalClose} heading={"Update Vendor Cost"}>
              <div className="field-div">
                  <span className="field-label">Cost Price (INR)</span>
                    <TextField 
                        placeholder="500, 1000 etc."
                        name="CostPrice" 
                        label="Cost Price" 
                        type="number"
                        onChange={this.handleCostPriceChange}
                        value={this.state.costPriceValue}
                        />
              </div>
            </Modal>
          )}
        </ModalTransition>
        <ModalTransition>
          {this.state.isModalOpen && (
            <Modal autoFocus={false} width={'80%'} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleModalClose },
              ]
            } onClose={this.handleModalClose} heading={"Add Existing Items "}>
              <ItemsPage isVendorAdd={true} existingItems = {this.state.dataCompare} handleAddItem={this.handleAddItem}
              ></ItemsPage>
            </Modal>
          )}
        </ModalTransition>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...flag }, dispatch)
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ItemCategory);
