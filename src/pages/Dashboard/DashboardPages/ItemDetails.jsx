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
import DynamicTable from '@atlaskit/dynamic-table';
import SearchIcon from "@atlaskit/icon/glyph/search";
import { CreatableSelect } from '@atlaskit/select';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextArea from '@atlaskit/textarea';
import Gallery from 'react-grid-gallery';

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../../../routing/BreadCrumbIcons"
import EditorEditIcon from '@atlaskit/icon/glyph/editor/edit';
// Components
// import ContentWrapper from '../../../components/ContentWrapper';

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
var changeCase = require("change-case");

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}


// api url path

var url_itemvendor = "/v1/itemvendors/";
var url_item = "/v1/items/";
var url_vendoritempair = "/v1/vendoritemspair/";
const loaderURL = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/loading-gifs/deadpool.gif"

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

const emptyModalData = {
        "id": "",
        "contact_phone": "",
        "contact_name": "",
        "pincode": "",
        "city": "",
        "state": "",
        "source": "",
        "address": "",
        "owner_name": "",
        "owner_phone": "",
        "company_name": "",
        "email": ""
    }

const status_dict = {
  'to_be_updated':'To Be Updated',
  'rejected':'Rejected',
  'shortlisted':'Shortlisted',
  'ready':'Ready',
}

const statusOptions = [{'value':'to_be_updated','label':'To Be Updated'},
                       {'value':'rejected','label':'Rejected'},
                       {'value':'shortlisted','label':'Shortlisted'},
                       {'value':'ready','label':'Ready'}
                      ]
const deleteConfMessage = "Are you sure you want to remove the vendor? Please note that this will not delete the vendor but will remove this vendor the items."
const deleteConfHeader = "Confirm Vendor Removal"


class ItemDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataVendor:[],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':20,'label':'20 Items/Page'},
      
      ImageList:[],
      // filter variables
      sortByOptions: [],
      orderByOptions: [],
      cityOptions: [],
      stateOptions: [],
      sourceOptions: [],

      searchIcon: true,
      sourceValue: [],
      cityValue: [],
      stateValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      costPriceValue:"",
      
      // Modal variables

      isModalOpen: false,
      submitError: "",
      isNew: true,
      modalData: emptyModalData,
      activeDataId: "",
      isConfModalOpen:false,
      costUpdateModal:false,
      isStatusUpdate:false,
      statusValue:""

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
      city: (this.state.cityValue).map(x => x['value']).join(","),
      state: (this.state.stateValue).map(x => x['value']).join(",")
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url_itemvendor + this.state.data.id ,'get', payload)
      .then(response => {
        const { data, success, num_pages } = response;
        if (success) {
          this.setState({
            dataVendor: data,
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

  handleStatusValueChange = value => {
    this.setState({ statusValue: value })
  };

  handleCityChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ cityValue: value, pageNum: 1 }, () => {
      this.applyFilter({ city: data, page_num: 1 });
    });
  };

  handleStateChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ stateValue: value, pageNum: 1 }, () => {
      this.applyFilter({ state: data, page_num: 1 });
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


  handleDelete = () => {
    const dataId = this.state.activeDataId
    const dataList = this.state.dataVendor;
    const index = dataList.findIndex(x => x.id === dataId);
    console.log(index)
    api(url_vendoritempair  + dataId, 'delete',{}).then(response => {
      const { message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          dataVendor: [
            ...this.state.dataVendor.slice(0, index),
            ...this.state.dataVendor.slice(index + 1)
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

  handleStatusChange = () => {
    this.setState({
      isStatusUpdate:true
    })
  }

  handleCloseStatus = () => {
    this.setState({
      isStatusUpdate:false
    })
  }

  handleUpdateStatus = () => {
    api(url_item  + this.state.data.id, 'put' ,{'name': this.state.data.name, 'status':this.state.statusValue.value})
  .then(response => {
    const { data, message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          data:data,
          loaded: true,  
          isStatusUpdate:false  
        });
      }
  })
}


  handleEditorIconClick = event => {
    const dataId = event.currentTarget.dataset.id;
    const dataList = this.state.dataVendor;
    const index = dataList.findIndex(x => x.id === parseInt(dataId,10));
    console.log(index,dataList,dataId)
    var costPrice = this.state.dataVendor[index]['cost_price']
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
    const dataList = this.state.dataVendor;
    const index = dataList.findIndex(x => x.id === parseInt(dataId));

    // console.log(index)
    const payload = {
      'vendor':dataList[index].vendor_details.id,
      'item':this.state.data.id,
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
          dataVendor: [
            ...this.state.dataVendor.slice(0, index),
            data,
            ...this.state.dataVendor.slice(index + 1)
          ],
          loaded: true,    
          activeDataId:"",
          costUpdateModal:false
        });
      }
    });

  }

  // submitData = data => {
  //   var submit = true
  //   const dataList = this.state.data;
  //   const index = dataList.findIndex(x => x.id === this.state.activeDataId);
  //   const sourceList = this.state.sourceOptions;
  //   const indexSource = sourceList.findIndex(x => x.value === data.source.value);

  //   // console.log(index)
  //   if (submit) {
  //     this.setState({ loaded: false });
  //     if (this.state.isNew) {
  //       api(url, 'post' ,{
  //         company_name: data.company_name,
  //         owner_name: data.owner_name,
  //         owner_phone: data.owner_phone,
  //         contact_name: data.contact_name,
  //         contact_phone: data.contact_phone,
  //         city: data.city.value,
  //         state: data.state.value,
  //         address: data.address,
  //         pincode: data.pincode,
  //         source: data.source.value,
  //         email: data.email,
  //       }).then(response => {
  //         const { data, message, success } = response;
  //         this.props.actions.addFlag({
  //           message: message,
  //           appearance: (success ? "warning" :  "danger")
  //         });    
  //         if (success){
  //           if (indexSource === -1){
  //             this.setState({
  //               sourceOptions:[{'value':data.source,'label':changeCase.titleCase(data.source)},...this.state.sourceOptions]
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
  //         company_name: data.company_name,
  //         owner_name: data.owner_name,
  //         owner_phone: data.owner_phone,
  //         contact_name: data.contact_name,
  //         contact_phone: data.contact_phone,
  //         city: data.city.value,
  //         state: data.state.value,
  //         address: data.address,
  //         pincode: data.pincode,
  //         source: data.source.value,
  //         email: data.email,
  //       }).then(response => {
  //         const { data, message, success } = response;
  //         this.props.actions.addFlag({
  //           message: message,
  //           appearance: (success ? "warning" :  "danger")
  //         });    
  //         if (success){
  //           if (indexSource === -1){
  //             this.setState({
  //               sourceOptions:[{'value':data.source,'label':changeCase.titleCase(data.source)},...this.state.sourceOptions]
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
    let filtersData =  {  page_num: this.state.pageNum, page_size: this.state.pageSize.value }

    
    api(url_item + textPath, 'get', {}).then(response => {
      const { data,  message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });
      if (success) {

        var IMAGES = []
        for(var i = 0; i < data.image_details.length; i++){
          // var meta = getMeta(data.image_details[i].path)
          IMAGES.push(
            {
              src: data.image_details[i].path,
              thumbnail: data.image_details[i].path,
              // thumbnailWidth: meta['width'],
              // thumbnailHeight: meta['height'],
              isSelected: false,
              caption: ""
          }
          )
        }
    
        this.setState(
          {
            ImageList:IMAGES,
            data: data,
            statusValue:{'value':data.status,'label':status_dict[data.status]}
          }
        );

        api(url_itemvendor + textPath, 'get', filtersData).then(response => {
          const { data, filters, message, success, num_pages } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });
          if (success) {
            this.setState(
              {
                dataVendor: data,
                loaded: true,
                numPages: num_pages,
                sortByOptions: JSON.parse(JSON.stringify(filters.sort_by)),
                orderByOptions: JSON.parse(JSON.stringify(filters.order_by)),
                stateOptions: JSON.parse(JSON.stringify(filters.states)),
                cityOptions: JSON.parse(JSON.stringify(filters.cities)),
                sourceOptions: JSON.parse(JSON.stringify(filters.source))
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


    const DataWrapper = styled.div`
      width: 100%;
      padding-top:15px;
  `  ;

    const SortIconContainer = styled.div`
      margin-top:46px;
      cursor:pointer
  `  ;

    const head = {
      cells: [
        {
          key: "company",
          content: "Company",
          width: 25,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "owner_details",
          content: "Owner Details",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        // {
        //   key: "other_contact",
        //   content: "Other Contact Details",
        //   width: 20,
        //   isSortable: false,
        //   shouldTruncate: false
        // },
        {
          key: "address",
          content: "City & State",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "cost_price",
          content: "Cost",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "operations",
          content: "Operations",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
      ]
    }


    let rowRenderElement = null;
    // if (this.state.loaded) {
    rowRenderElement = this.state.dataVendor.map((row, index) => ({
      key: `row.id`,
      cells: [
        {
          key: row.id,
          content: changeCase.titleCase(row.vendor_details.company_name)
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.vendor_details.owner_name ? row.vendor_details.owner_name : "") + (row.vendor_details.owner_phone ? " (" + row.vendor_details.owner_phone + ")" : "")
        },
        {
          key: row.id,
          content: titleCase(row.vendor_details.city + ", "+row.vendor_details.state)
        },
        {
          key: row.id,
          content: <div className="cost-price-container">
                      <div className="cost-price">
                          {"₹ " + row.cost_price}
                      </div>
                      <div data-id={row.id} onClick={this.handleEditorIconClick.bind(this)} className="cost-price-icon">
                        <EditorEditIcon />
                      </div>
                  </div>
        },
        {
          key: row.id,
          content: <DropdownMenu
            trigger="Options"
            triggerType="button"
            shouldFlip={false}
            position="bottom"
          >
            <DropdownItemGroup key={row.vendor_details.id}>
              <Link to={"/adminpanel/vendors/" + row.vendor_details.id}><DropdownItem data-id={row.vendor_details.id}>Open</DropdownItem></Link>
              <DropdownItem data-id={row.id} onClick={this.handleConfModalOpen.bind(this)}>Remove</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>
        },
      ]
    }
    ));

    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    breadCrumbElement = Path.map((row, index) => {
      if (index > 1 && index < (Path.length)){
        var textPath = ""
        if (index == 3){
          var textPath = this.state.data ? changeCase.titleCase(this.state.data.name) : ""
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

    // const IMAGES =
    //     [{
    //             src: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
    //             thumbnail: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_n.jpg",
    //             thumbnailWidth: 320,
    //             thumbnailHeight: 174,
    //             isSelected: true,
    //             caption: "After Rain (Jeshu John - designerspics.com)"
    //     },
    //     {
    //             src: "https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg",
    //             thumbnail: "https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_n.jpg",
    //             thumbnailWidth: 320,
    //             thumbnailHeight: 212,
    //             tags: [{value: "Ocean", title: "Ocean"}, {value: "People", title: "People"}],
    //             caption: "Boats (Jeshu John - designerspics.com)"
    //     },
        
    //     {
    //             src: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_b.jpg",
    //             thumbnail: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_n.jpg",
    //             thumbnailWidth: 320,
    //             thumbnailHeight: 212
    //     }]

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
            <Link to={"/adminpanel/items/" + this.state.data.id + "/edit-item"}>
              <Button  appearance="warning">
              Edit Item
              </Button>
            </Link>
          </GridColumn>
        </Grid>
        <Grid layout="fluid">
          <h2>Item Details</h2>
        </Grid>
        <hr></hr>
        <Grid layout="fluid">
          <GridColumn medium={6}>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Name</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.name ? titleCase(this.state.data.name) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Category</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.category_details ? titleCase(this.state.data.category_details.category) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Sub Category</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.category_details? titleCase(this.state.data.category_details.sub_category) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Dimensions</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.dimensions? this.state.data.dimensions : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Description</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.description? this.state.data.description : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Selling Price</b></span></GridColumn> <GridColumn medium={4}><span className="item-details-text">: {this.state.data.sell_price? ("₹ " + this.state.data.sell_price) : ""}</span></GridColumn>
              </Grid>
              <Grid >
                <GridColumn medium={2}><span className="item-details-text"><b>Status</b></span></GridColumn> 
                {this.state.isStatusUpdate && (
                  
                <GridColumn medium={4} className="status-update-button-row"> 
                  <Select
                  className="single-select"
                  classNamePrefix="react-select"
                  options={statusOptions}
                  placeholder="Status"
                  value={this.state.statusValue}
                  onChange={this.handleStatusValueChange}
                />
                <Button appearance={"warning"} onClick={this.handleUpdateStatus}>
                  Update
                </Button>
                <Button appearance={"info"} onClick={this.handleCloseStatus}>
                  Close
                </Button>

                </GridColumn>
                )}
                {!this.state.isStatusUpdate && (
                <GridColumn medium={4}><span className="item-details-text">: {this.state.data.status ? status_dict[this.state.data.status] : ""}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;<Button appearance={"info"} onClick={this.handleStatusChange}>
                  Change
                </Button>
          </GridColumn>

                )}
              </Grid>

          </GridColumn>
          <GridColumn medium={6}>
            <Gallery enableImageSelection={false} images={this.state.ImageList}/>,
          </GridColumn>
        </Grid>
        <br></br>
        <Grid layout="fluid">
          <h2>Listed Vendors</h2>
        </Grid>
        <hr></hr>
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
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">City</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.cityOptions}
                placeholder="City"
                onChange={this.handleCityChange}
                value={this.state.cityValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">State</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.stateOptions}
                placeholder="State"
                onChange={this.handleStateChange}
                value={this.state.stateValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
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
          <DataWrapper>
          {/* <Grid>
                <GridColumn medium={12}>
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
              <br></br> */}
            <DynamicTable
              isLoading={!this.state.loaded}
              head={head}
              rows={rowRenderElement}
              defaultPage={1}
              className="user-table"
            />
          
          <Grid>
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
          </DataWrapper>
        </Grid>
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
)(ItemDetails);
