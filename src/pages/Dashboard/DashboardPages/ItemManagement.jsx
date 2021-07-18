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

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
// import DynamicTable from '@atlaskit/dynamic-table';
import SearchIcon from "@atlaskit/icon/glyph/search";
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import { StatusAlertService } from 'react-status-alert'
import 'react-status-alert/dist/status-alert.css'
import Checkbox from 'react-simple-checkbox';
import Form, { Field } from '@atlaskit/form';

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../../../routing/BreadCrumbIcons"
import TrashIcon from '@atlaskit/icon/glyph/trash';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
// Components

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


const checkboxTheme = {
  backgroundColor:'#fff', 
  borderColor:'#eeb83c', 
  uncheckedBorderColor:'#243859', 
  tickColor:'#eeb83c'
}


// api url path
var url = "/v1/items";
var urlitemstatusupdate = "/v1/itemsstatusupdate"
var urlmergeitems = "/v1/itemsmerge"
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

const emptyModalData = {
  "category": "",
  "description": "",
  "id": "",
  "sub_category": ""
};

const deleteConfMessage = "Are you sure you want to delete the item? Please note that this will delete the said item from all vendors etc."
const deleteConfHeader = "Confirm Item Deletion"
const mergeConfHeader = "Confirm Item Merge"
const statusUpdateHeader = "Update Status of Selected Items"

class ItemCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':20,'label':'20 Items/Page'},
      
      
      // filter variables
      sortByOptions: [],
      orderByOptions: [],
      categoryOptions: [],
      statusOptions: [],
      searchIcon: true,
      categoryValue: [],
      statusValue:[],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      selectedList:[],
      selectedItems:[],
      // Modal variables

      isModalOpen: false,
      submitError: "",
      isNew: true,
      modalData: emptyModalData,
      activeDataId: "",
      isConfModalOpen:false,
      isStatusModalOpen:false,
      isMergeConfModalOpen:false
    };
  }

  // alert = useAlert()
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
    api(url,'get', payload)
      .then(response => {
        const { data, success, num_pages } = response;
        if (success) {
          this.setState({
            data: data,
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

  handleStatusChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ statusValue: value, pageNum: 1 }, () => {
      this.applyFilter({ status: data, page_num: 1 });
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

  clearFilter = () => {
    this.setState({
      categoryValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      pageNum: 1,
      searchIcon: true
    }, () => {
      this.applyFilter();
    });
  }


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

  handleStatusModalOpen = () => {
    this.setState({
      isStatusModalOpen:true
    })
  }


  handleStatusModalClose = () => {
    this.setState({
      isStatusModalOpen:false
    })
  }

  handleStatusUpdate = data => {
      var itemslist = (this.state.selectedList).join(",");
      this.setState({
        loaded:false
      })
      const payload = {
        items: itemslist,
        status: data.status.value,
      }
      api(urlitemstatusupdate, 'post-formdata' ,payload).then(response => {
        const { message, success } = response;
        StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
        if (success){
          this.setState({
            loaded: true,
          });
          this.handleStatusModalClose();  
        }else{
          this.setState({
            loaded:true
          })
        }
      });

  }

  handleMergeConfModalOpen = () =>{
    this.setState({
      isMergeConfModalOpen:true
    })
  }
  handleMergeConfModalClose = () =>{
    this.setState({
      isMergeConfModalOpen:false
    })
  }

  handleMerge = () => {
    console.log('merge query made')
    var itemslist = (this.state.selectedList).join(",");
    this.setState({
      loaded:false
    })
    const payload = {
      items: itemslist
    }
    
    function indexgive(inputlist,selectlist, i) {
      var indexList  = inputlist.findIndex(x => x.id === selectlist[i]);
      return indexList
    }

    api(urlmergeitems, 'post-formdata' ,payload).then(response => {
      const { data, message, success } = response;
      StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
      if (success){
        var dataList = this.state.data;
        var dataListNew = []
        var index = null
        for (var i = 0 ; i < this.state.selectedList.length; i++){
          index = indexgive(dataList,this.state.selectedList, i)
          dataListNew = [
            ...dataList.slice(0, index),
          ...dataList.slice(index + 1)
          ]
          dataList = dataListNew
        }
        this.setState({
          loaded: true,
          selectedList:[],
          selectedItems:[],
          data:[...dataList,data]
        })
        this.handleMergeConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
    });

  }


  handleCheckBoxToggle = event => {
    const dataId = event.currentTarget.dataset.id;
    var selectedList = this.state.selectedList;
    var selectedItems = this.state.selectedItems;
    var totalData = this.state.data;

    const index = selectedList.indexOf(parseInt(dataId));
    const indexItem = selectedItems.findIndex(x => x.id === parseInt(dataId));  
    const indexDataItem = this.state.data.findIndex(x => x.id === parseInt(dataId));
    if (index > -1){
      selectedList.splice(index, 1);
      selectedItems = [
        ...selectedItems.slice(0, indexItem),
        ...selectedItems.slice(indexItem + 1)
      ]
    }else{
      selectedList.push(parseInt(dataId))
      selectedItems = [
        ...selectedItems,
        totalData[indexDataItem]
      ]
    }
    this.setState({
      selectedList:selectedList,
      selectedItems:selectedItems
    })
  }

  handleSelectionRemove = () => {
    this.setState({
      selectedList:[],
      selectedItems:[]
    })
  }

  handleDelete = () => {
    const dataId = this.state.activeDataId
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === dataId);    
    api(url + '/' + dataId, 'delete',{}).then(response => {
      const { message, success } = response;
      StatusAlertService.showAlert(message,success ? 'info': 'error',{autoHideTime:1000})
      if (success){
        this.setState({            
          data: [
            ...this.state.data.slice(0, index),
            ...this.state.data.slice(index + 1)
          ],
          // selectedList:[...this.state.selectedList.slice()]
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


  // On Load
  componentDidMount() {
    let filtersData =  {  page_num: this.state.pageNum, page_size: this.state.pageSize.value }
    api(url, 'get', filtersData).then(response => {
      const { data, filters, success, num_pages } = response;
      // StatusAlertService.showAlert(message,success ? 'info': 'error',{autoHideTime:1000})
      if (success) {
        this.setState(
          {
            data: data,
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

    let renderSelectedElement = null;
    if (this.state.loaded === true) {
      renderSelectedElement = null;
      renderSelectedElement = this.state.selectedItems.map((row, key) => {
        return (
          <GridColumn key = {key} medium={2} className="item-grid">
                <div className="item-div">
                  <div className="item-div-internal">
                    <div className="item-div-actions">
                      <div className="item-checkbox">
                        <div data-id={row.id} className="item-checkbox-container" onClick={this.handleCheckBoxToggle}>
                          <Checkbox
                            color={checkboxTheme}
                            size={3}
                            tickSize={3}
                            borderThickness={2}
                            className="checkbox-style-dashboard"
                            checked={this.state.selectedList.indexOf(row.id) > -1 ? true : false}
                          />
                        </div>
                      </div>
                    </div>
                    <Link to={"/adminpanel/items/" + row.id}>
                    <div className="item-image-container">
                      <img alt={row.name} className="item-image" src={row.image_details.length > 0 ? row.image_details[row.image_details.findIndex(x => x.is_primary === true) > 0 ? row.image_details.findIndex(x => x.is_primary === true) : 0].path : noImagePath}/>
                    </div>
                    <div className="item-name">
                      {changeCase.titleCase(row.name)} 
                      <br></br>
                      {row.category_details && (
                        <div className="category-pill">{row.category_details ? titleCase(row.category_details.category + " - " + row.category_details.sub_category): ""}</div>
                      )}
                    </div>
                    </Link>
                  </div>  
              </div>
          </GridColumn>
        );
      }
    )} 

    let renderBodyElement = null;
    if (this.state.loaded === true) {
      renderBodyElement = null;
      renderBodyElement = this.state.data.map((row, key) => {
        if (this.props.isVendorAdd){
          return (
            <GridColumn key = {key} medium={2} className="item-grid">
                  <div className="item-div-vendor-add">
                    <div className="item-div-internal-vendor-add">
                      <div className="item-image-container-vendor-add">
                        <img alt={row.name} className="item-image-vendor-add" src={row.image_details.length > 0 ? row.image_details[row.image_details.findIndex(x => x.is_primary === true) > 0 ? row.image_details.findIndex(x => x.is_primary === true) : 0].path : noImagePath}/>
                      </div>
                      <div className="item-name-vendor-add">
                        {changeCase.titleCase(row.name)} 
                        <br></br>
                        {row.category_details && (
                          <div className="category-pill">{row.category_details ? titleCase(row.category_details.category + " - " + row.category_details.sub_category): ""}</div>
                        )}
                      </div>
                      <div data-id={row.id} onClick={this.props.existingItems.findIndex(x => x.item_details.id === row.id) >= 0 ? "" : this.props.handleAddItem} className={this.props.existingItems.findIndex(x => x.item_details.id === row.id) >= 0 ? "" : "add-remove-toggle-add"}>
                        {this.props.existingItems.findIndex(x => x.item_details.id === row.id) >= 0 ? "" : "Add"}
                      </div>
                    </div>  
                </div>
            </GridColumn>
    );
    }else{
          return (
            <GridColumn key = {key} medium={2} className="item-grid">
                  <div className="item-div">
                    <div className="item-div-internal">
                      <div className="item-div-actions">
                        <div className="item-checkbox">
                          <div data-id={row.id} className="item-checkbox-container" onClick={this.handleCheckBoxToggle}>
                            <Checkbox
                              color={checkboxTheme}
                              size={3}
                              tickSize={3}
                              borderThickness={2}
                              className="checkbox-style-dashboard"
                              checked={this.state.selectedList.indexOf(row.id) > -1 ? true : false}
                            />
                          </div>
                        </div>
                        <div className="item-remove-button" data-id={row.id} onClick={this.handleConfModalOpen.bind(this)} >
                          <div className="item-remove-icon-container">
                            <TrashIcon size={'medium'} ></TrashIcon>
                          </div>
                        </div>
                      </div>
                      <Link to={"/adminpanel/items/" + row.id}>
                      <div className="item-image-container">
                        <img alt={row.name} className="item-image" src={row.image_details.length > 0 ? row.image_details[row.image_details.findIndex(x => x.is_primary === true) > 0 ? row.image_details.findIndex(x => x.is_primary === true) : 0].path : noImagePath}/>
                      </div>
                      <div className="item-name">
                        {changeCase.titleCase(row.name)} 
                        <br></br>
                        {row.category_details && (
                          <div className="category-pill">{row.category_details ? titleCase(row.category_details.category + " - " + row.category_details.sub_category): ""}</div>
                        )}
                      </div>
                      </Link>
                    </div>  
                </div>
            </GridColumn>
    );

        }

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
        var textPath = changeCase.titleCase(Path[index])
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
                <img alt="loader" className="loader-image" src={loaderURL}></img>
            </div>
          </div>
        )}
      {/* <StatusAlert/> */}
      <div className="dashboard-page">
        {!this.props.isVendorAdd && (
        <Grid layout="fluid">
                <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        </Grid>
        )}
        {!this.props.isVendorAdd && (
        <Grid layout="fluid">
          <GridColumn medium={8}></GridColumn>

          <GridColumn medium={4}>
            <div className="button-row">
              <div className="button-container">
                <Button onClick={this.handleMergeConfModalOpen} isDisabled={this.state.selectedList.length > 1 ? false : true} appearance="warning">
                  Merge Items
                </Button>
              </div>
              <div className="button-container">
              <Button onClick={this.handleStatusModalOpen} isDisabled={this.state.selectedList.length > 0 ? false : true} appearance="warning">
                Update Status
              </Button>
              </div>
            <Link to={'/adminpanel/items/add-item'}>
              <div className="button-container">
              <Button appearance="warning">
                Add Item
              </Button>
              </div>
            </Link>
          </div>
          </GridColumn>
        </Grid>
        )}

        {(!this.props.isVendorAdd && this.state.selectedList.length > 0) && (
        <Grid layout="fluid">
            <span className="selected-item-count">
              Items Selected: {this.state.selectedList.length}
            </span>
            <span className="remove-selected-button">
                <CrossCircleIcon onClick={this.handleSelectionRemove} size={'medium'} ></CrossCircleIcon>
            </span>
        </Grid>
        )}
        

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
                classNamePrefix="select"
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
        
        <Grid layout="fluid">
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
        {this.state.selectedList.length > 0 && (  
        <div>
        <hr></hr>   
          <span><b>Current Selection</b></span>
        </div>
        )}     
        {this.state.selectedList.length > 0 && (  
            <Grid layout="fluid">
              
              {renderSelectedElement}
            </Grid>
          )}    
          
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
          {this.state.isMergeConfModalOpen && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Confirmed', appearance: 'warning', onClick: this.handleMerge },
                { text: 'Close', appearance: 'normal', onClick: this.handleMergeConfModalClose },
              ]
            } onClose={this.handleMergeConfModalClose} heading={mergeConfHeader}>
                Are you sure you want to merge the selected items? Once confirmed action cannot be reversed. The merging will follow the following logic:
                <ul>
                  <li><b>Name:</b> Name of merged item will take the longest availaible names</li>
                  <li><b>Description:</b> Description of merged item will take the longest availaible description</li>
                  <li><b>Dimesions:</b> Dimesions of merged item will take the longest availaible dimesions</li>
                  <li><b>Status:</b> Status of merged item will take the latest status i.e. if status of one of the items is ready then status would be ready</li>
                  <li><b>Category:</b> Category of merged item would be first availaible category system finds</li>
                  <li><b>Selling Price:</b> Selling price would be lowest selected selling price for selected item</li>
                  <li><b>Images:</b> All images would be merged. Duplicates would be present</li>
                  <li><b>Vendors:</b> All vendors would be merged. Cost price would be lowest price for the vendor for selected items</li>
                </ul>
            </Modal>

          )}
        </ModalTransition>

        <ModalTransition>
          {this.state.isStatusModalOpen && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleStatusModalClose },
              ]
            } onClose={this.handleStatusModalClose} height={350} heading={statusUpdateHeader}>

              <Form onSubmit={this.handleStatusUpdate}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        <Field name="status"
                              label="Status" 
                              defaultValue={this.state.statusOptions[0]}
                              isRequired
                              >
                          {({ fieldProps }) => <Select options={this.state.statusOptions} 
                            {...fieldProps} />}
                        </Field>
                      </GridColumn>

                    </Grid>
                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <br></br>
                        <Button type="submit" appearance="warning">
                          Update
                      </Button>
                      </GridColumn>
                    </Grid>
                  </form>
                )}
              </Form>
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
    actions: bindActionCreators({}, dispatch)
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ItemCategory);
