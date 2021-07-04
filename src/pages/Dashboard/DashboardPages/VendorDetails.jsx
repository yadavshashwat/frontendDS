// React
import React, { Component } from 'react';
import { Link } from 'react-router';

// Styles
import "../../../css/dashboard.css"

// Backend Connection
import { api,fileHandlerApi } from "../../../helpers/api.jsx";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
// import DynamicTable from '@atlaskit/dynamic-table';
import SearchIcon from "@atlaskit/icon/glyph/search";
import { CreatableSelect } from '@atlaskit/select';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Dropzone from 'react-dropzone'
import { StatusAlertService } from 'react-status-alert'
import 'react-status-alert/dist/status-alert.css'

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../../../routing/BreadCrumbIcons"
import EditorEditIcon from '@atlaskit/icon/glyph/editor/edit';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import DocumentFilledIcon from '@atlaskit/icon/glyph/document-filled';
// Components
// import ContentWrapper from '../../../components/ContentWrapper';
import ItemsPage from "../DashboardPages/ItemManagement"
// Other Packages
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
var url_doc_upload = "/v1/vendordocupload/";
var url_document_delete = "/v1/vendordocdelete/"
const loaderURL = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/loading-gifs/deadpool.gif"
// var noImagePath = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/other/nothing_image_new.png";
var noImagePath = "";



const deleteConfMessage = "Are you sure you want to delete the vendor Item? Please note that this will not delete any items but will remove vendor from the given item."
const deleteConfHeader = "Confirm Vendor Item Removal"

const deleteDocConfMessage = "Are you sure you want to delete the vendor document?"
const deleteDocConfHeader = "Confirm Vendor Document Deletion"

class ItemCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      dataItems: [],
      dataCompare:[],
      dataDocuments:[],
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
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      cityOptions:[],
      stateOptions:[],
      sourceOption:[],
      
      // Modal variables

      isModalOpen: false,
      isEditModalOpen: false,
      submitError: "",
      isNew: true,
      activeDataId: "",
      isConfModalOpen:false,
      fileList:[],
      dropZoneActive:false

    };
  }

  hideSearchIcon = () => {
    this.setState({ searchIcon: false });
  };


  handleFileDrop = acceptedFiles => {
    const currentState = this.state.fileList
    var indexFile = NaN
    function indexgive(i) {
      var indexList  = currentState.findIndex(x => x.path === acceptedFiles[i].path);
      return indexList
    }
    for(var i = 0; i < acceptedFiles.length ; i += 1) {
      indexFile = indexgive(i)
      if(indexFile < 0 ){
        currentState.push(acceptedFiles[i])
      }
    }
    this.setState({
      fileList:currentState
    })
  }


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
      StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
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
      StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
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
      StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
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

  handleFileRemoveClick = event =>{
    const path = event.currentTarget.dataset.id
    // console.log(path)
    var currentState = this.state.fileList
    var indexFile = currentState.findIndex(x => x.path === path);
    this.setState({fileList: [
        ...currentState.slice(0, indexFile),
        ...currentState.slice(indexFile + 1)
      ]
    })
    
  }

  handleNewFiles = () => {
    this.setState({
      dropZoneActive:true
    })
  }

  handleNewFilesClose = () => {
    this.setState({
      dropZoneActive:false
    })
  }


  handleEditModalOpen = event => {
    this.setState({
      isEditModalOpen:true
    })
  }

  handleEditModalClose = event => {
    this.setState({
      isEditModalOpen:false
    })
  }


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

  
  submitData = data => {
    var submit = true
    if (submit) {
      this.setState({ loaded: false });
     
      api(url_vendor  + this.state.data.id,'put', {
        company_name: data.company_name,
        owner_name: data.owner_name,
        owner_phone: data.owner_phone,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        city: data.city.value,
        state: data.state.value,
        address: data.address,
        pincode: data.pincode,
        source: data.source.value,
        email: data.email,
      }).then(response => {
        const { data, message, success } = response;
        StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
        if (success){
          this.setState({            
            data: data,
            loaded: true,            
          });
          this.handleEditModalClose();
        }else{
          this.setState({
            loaded:true
          })
        }
      });
      
    }
  }


  handleDocConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    this.setState({
      isDocConfModalOpen:true,
      activeDataId: parseInt(dataId,10)
    })
  }


  handleDocConfModalClose = () => {
    this.setState({
      isDocConfModalOpen:false,
      activeDataId:""
    })
  }


  handleDeleteDoc = () =>{
    const dataId = this.state.activeDataId
    var currentState = this.state.dataDocuments
    var indexFile = currentState.findIndex(x => x.id === parseInt(dataId));
    
    api(url_document_delete  + dataId, 'delete' ,{}).then(response => {
    const { message, success } = response;
    StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})
    if (success){
      this.setState({dataDocuments: [
        ...currentState.slice(0, indexFile),
        ...currentState.slice(indexFile + 1)
      ],
      isDocConfModalOpen:false,
      activeDataId:""
    });
  }
  })
  .catch(error => console.log(error))
}


  handleFileUpload = () => {
    this.setState({
      loaded:false
    })
    const formData = new FormData();
    for(var i = 0; i < this.state.fileList.length ; i += 1) {
      formData.append("file", this.state.fileList[i]);          
    }
    
      fileHandlerApi(url_doc_upload + this.state.data.id ,formData)
      .then(response => {
        const {data, message, success } = response;
        StatusAlertService.showAlert(message, success ? 'info': 'error',{autoHideTime:1000})

      if (success){
        this.setState({
          fileList:[],
          loaded:true ,
          dataDocuments:[...this.state.dataDocuments,...data],
          dropZoneActive:false            
        });
        }
      }).catch(error => console.log(error))
  }
  // On Load
  componentDidMount() {
    var Path = window.location.pathname.split("/")
    var textPath = null;
    textPath = decodeURIComponent(Path[3])
    console.log(textPath)

    // let filtersData =  {  page_num: this.state.pageNum, page_size: this.state.pageSize.value }
    let filtersData =  {  is_all: "1" }

    api(url_vendor + textPath, 'get', {}).then(response => {
      const { data, success,filters } = response;
      if (success) {
        this.setState(
          {
            data: data,
            dataDocuments:data.document_details,
            stateOptions: JSON.parse(JSON.stringify(filters.states)),
            cityOptions: JSON.parse(JSON.stringify(filters.cities)),
            sourceOptions: JSON.parse(JSON.stringify(filters.source))

          }
        );

        api(url_vendoritem + textPath, 'get', filtersData).then(response => {
          const { data, filters, success, num_pages } = response;
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
                        <div className="item-remove-button-vendor" data-id={row.id} onClick={this.handleConfModalOpen.bind(this)} >
                          <div className="item-remove-icon-container">
                            <TrashIcon size={'medium'} ></TrashIcon>
                          </div>
                        </div>
                        <Link to={"/adminpanel/items/" + row.item_details.id}>
                          <div className="item-image-container-vendor">
                            <img alt={row.item_details.name} className="item-image" src={row.item_details.image_details.length > 0 ? row.item_details.image_details[row.item_details.image_details.findIndex(x => x.is_primary === true) > 0 ? row.item_details.image_details.findIndex(x => x.is_primary === true) : 0].path : noImagePath}/>
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

  
    let renderUploadedDocuments = null;
    
    renderUploadedDocuments = this.state.dataDocuments.map((row, key) => {
    return (
            <GridColumn key = {key} medium={4} className="item-grid">
                  <div className="file-div-showcase">
                    <div className="file-remove-button" data-id={row.id} 
                    onClick={this.handleDocConfModalOpen.bind(this)} 
                    >
                      <div className="item-remove-icon-container">
                        <TrashIcon size={'medium'} ></TrashIcon>
                      </div>
                    </div>
                    <a href={row.path} target="_blank" rel="noopener noreferrer">
                      <div className="file-div-internal">
                        <div className="file-icon-showcase">
                          <DocumentFilledIcon></DocumentFilledIcon>
                        </div>
                        <div className="file-name-showcase">
                          {row.friendly_name}
                        </div>
                      </div>  
                    </a>
                </div>
            </GridColumn>
    );
  });

    let renderDocumentList = null;
    
    renderDocumentList = this.state.fileList.map((row, key) => {
    return (
            <Grid key = {key}>
                  <div className="file-div">
                    <div className="file-div">
                      <div data-id={row.path}  className="remove-file" onClick={this.handleFileRemoveClick}>
                        Remove
                      </div>
                      <div className="file-name">
                        {row.name}
                      </div>
                    </div>  
                </div>
            </Grid>
    );
  });



    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    var textPath = ""
    breadCrumbElement = Path.map((row, index) => {
      if (index > 1 && index < (Path.length)){
        textPath = ""
        if (index === 3){
          textPath = this.state.data ? changeCase.titleCase(this.state.data.company_name) : ""
        }else{
          textPath = changeCase.titleCase(Path[index])
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
                <img alt="loader" className="loader-image" src={loaderURL}></img>
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
            
              <Button onClick={this.handleEditModalOpen} appearance="warning">
                Edit Vendor
              </Button>
            
          </GridColumn>
        </Grid>
        <Grid layout="fluid">
          <h3>Vendor Details</h3>
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
              
              <GridColumn medium={12}>
                <br></br>
              
              <Grid layout="fluid">
                <h3>Vendor Documents</h3>
              </Grid>
              <hr></hr>      
              <Grid> {renderUploadedDocuments} </Grid>
              <Grid>
              {(this.state.dropZoneActive)  && (
                  <div className="drop-zone-file-div">
                  <div className="field-div">
                        <span className="field-label">Documents</span>
                        <Dropzone 
                          onDrop={acceptedFiles => this.handleFileDrop(acceptedFiles)}
                        >
                          {({getRootProps, getInputProps}) => (
                            <section className="drop-container">
                              <div {...getRootProps({className: 'dropzone'})}>
                                <input {...getInputProps()} />
                                  Drag 'n' drop some files here, or click to select files
                              </div>
                            </section>
                          )}
                  </Dropzone>
                
                  </div>
                    {(this.state.fileList.length > 0)  && (
                    <div className="document-list">
                      {renderDocumentList}  
                      <Button onClick={this.handleFileUpload} appearance="warning">
                        Upload
                      </Button>
                    </div>
                  
                  )}
                </div>
              )}
              </Grid>
              {(!this.state.dropZoneActive)  && (
              <Grid> 
                <Button appearance={'info'} onClick={this.handleNewFiles}>
                  Add New Files
                </Button>
              </Grid>
              )}
              {(this.state.dropZoneActive)  && (
              <Grid> 
                <Button appearance={'info'} onClick={this.handleNewFilesClose}>
                  Close File Upload
                </Button>
              </Grid>
              )}

              </GridColumn>
              
          
        </Grid>
        <br></br>
        <br></br>
        <Grid layout="fluid">
          <h3>Listed Items</h3>
        </Grid>
        {/* <br></br> */}
        <hr></hr>
        <Grid layout="fluid">
          <GridColumn medium={8}></GridColumn>
          <GridColumn medium={4}>
            <div className="item-vendor-button-row">
            <div className="item-add-button-vendor">
            <Button onClick={this.handleAddModalOpen} appearance="warning">
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
          {this.state.isDocConfModalOpen && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Confirmed', appearance: 'warning', onClick: this.handleDeleteDoc },
                { text: 'Close', appearance: 'normal', onClick: this.handleDocConfModalClose },
              ]
            } onClose={this.handleConfModalClose} heading={deleteDocConfHeader}>
                {deleteDocConfMessage}              
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
        
        <ModalTransition>
          {this.state.isEditModalOpen && (

            <Modal autoFocus={false}  width={'80%'}  actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleEditModalClose },
              ]
            } onClose={this.handleEditModalClose} height={600} heading={"Edit Vendor"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                    <GridColumn medium={6}>
                        <Field name="company_name" defaultValue={this.state.data.company_name}
                              label="Company Name" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="company_email" defaultValue={this.state.data.email}
                              label="Company Email" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="owner_name" defaultValue={this.state.data.owner_name}
                              label="Owner Name" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="owner_phone" defaultValue={this.state.data.owner_phone}
                              label="Owner Phone" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="contact_name" defaultValue={this.state.data.contact_name}
                              label="Other Contact Name" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="contact_phone" defaultValue={this.state.data.contact_phone}
                              label="Other Contact Phone" 
                              >
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="address" defaultValue={this.state.data.address}
                              label="Address" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>

                    <GridColumn medium={3}>
                        <Field name="city" defaultValue={{ 'value': this.state.data.city, 'label': changeCase.titleCase(this.state.data.city) }}
                              label="City" 
                              >
                          {({ fieldProps }) => <Select options={this.state.cityOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>

                      <GridColumn medium={3}>
                        <Field name="state" defaultValue={{ 'value': this.state.data.state, 'label': changeCase.titleCase(this.state.data.state) }}
                              label="State" 
                              >
                          {({ fieldProps }) => <Select options={this.state.stateOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>


                    <GridColumn medium={4}>
                        <Field name="pincode" defaultValue={this.state.data.pincode}
                              label="Pincode" 
                              >
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    

                      <GridColumn medium={8}>
                        <Field name="source" defaultValue={{ 'value': this.state.data.source, 'label': changeCase.titleCase(this.state.data.source) }}
                              label="Source" 
                              >
                          {({ fieldProps }) => <CreatableSelect options={this.state.sourceOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>
                    </Grid>
                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <span className="invalid">{this.state.submitError}</span>
                        <br></br>
                        <Button type="submit" appearance="warning">
                          Submit
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
