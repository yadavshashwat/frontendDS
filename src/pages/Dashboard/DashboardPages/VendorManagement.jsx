// React
import React, { Component } from 'react';

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


//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../../../routing/BreadCrumbIcons"

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
var url = "/v1/vendors";

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
const deleteConfMessage = "Are you sure you want to delete the vendor? Please note that this will not delete any items but will remove this vendor from all items."
const deleteConfHeader = "Confirm Vendor Deletion"


class Vendors extends Component {
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
      
      // Modal variables

      isModalOpen: false,
      submitError: "",
      isNew: true,
      modalData: emptyModalData,
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
      city: (this.state.cityValue).map(x => x['value']).join(","),
      state: (this.state.stateValue).map(x => x['value']).join(",")
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
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === dataId);
    api(url + '/' + dataId, 'delete',{}).then(response => {
      const { message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
        this.setState({            
          data: [
            ...this.state.data.slice(0, index),
            ...this.state.data.slice(index + 1)
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

  
  handleEditModalOpen = event => {
    const data_id = event.currentTarget.dataset.id
    this.setState({ isNew: false, activeDataId: parseInt(data_id,10) });

    api(url + '/' + data_id,'get', {}).then(response => {
      const { data, success } = response;
      if (success) {
        this.setState(
          {
            modalData: data,
          }, () => {
            this.setState({ isModalOpen: true });
          });
      }
    });
  }


  handleAddModalOpen = () => {
    this.setState({
      isModalOpen: true,
      isNew: true,
      activeDataId: "",
      modalData: Object.assign({}, emptyModalData)
    });
  }

  handleModalClose = () => {
    this.setState({
      isModalOpen: false,
      isNew: true,
      activeDataId: "",
      modalData: Object.assign({}, emptyModalData)
    });
  }



  
  submitData = data => {
    var submit = true
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    const sourceList = this.state.sourceOptions;
    const indexSource = sourceList.findIndex(x => x.value === data.source.value);

    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, 'post' ,{
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
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });    
          if (success){
            if (indexSource === -1){
              this.setState({
                sourceOptions:[{'value':data.source,'label':changeCase.titleCase(data.source)},...this.state.sourceOptions]
              })
            }            


            this.setState({
              data: [data, ...this.state.data],
              loaded: true
            });
            this.handleModalClose();  
          }else{
            this.setState({
              loaded:true
            })
          }
        });
      }else{
        api(url + '/' + this.state.activeDataId,'put', {
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
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });    
          if (success){
            if (indexSource === -1){
              this.setState({
                sourceOptions:[{'value':data.source,'label':changeCase.titleCase(data.source)},...this.state.sourceOptions]
              })
            }            

            this.setState({            
              data: [
                ...this.state.data.slice(0, index),
                  data,
                ...this.state.data.slice(index + 1)
              ],
              loaded: true,            
            });
            this.handleModalClose();
          }else{
            this.setState({
              loaded:true
            })
          }
        });
      }
    }
  }


  // On Load
  componentDidMount() {
    let filtersData =  {  page_num: this.state.pageNum, page_size: this.state.pageSize.value }
    api(url, 'get', filtersData).then(response => {
      const { data, filters, message, success, num_pages } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });

      if (success) {
        this.setState(
          {
            data: data,
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
        {
          key: "other_contact",
          content: "Other Contact Details",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "address",
          content: "City & State",
          width: 15,
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
    rowRenderElement = this.state.data.map((row, index) => ({
      key: `row.id`,
      cells: [
        {
          key: row.id,
          content: changeCase.titleCase(row.company_name)
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.owner_name ? row.owner_name : "") + (row.owner_phone ? " (" + row.owner_phone + ")" : "")
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.contact_name ? row.contact_name : "") + (row.contact_phone? " (" + row.contact_phone + ")" : "")
        },
        {
          key: row.id,
          content: titleCase(row.city + ", "+row.state)
        },
        {
          key: row.id,
          content: <DropdownMenu
            trigger="Options"
            triggerType="button"
            shouldFlip={false}
            position="bottom"
          >
            <DropdownItemGroup key={row.id}>
              <DropdownItem data-id={row.id} onClick={this.handleEditModalOpen.bind(this)}>Edit</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
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
      <div className="dashboard-page">
        <Grid layout="fluid">
                <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        </Grid>
        <Grid layout="fluid">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
          <Button onClick={this.handleAddModalOpen} appearance="warning">
            Add Vendor
          </Button>
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
          {this.state.isModalOpen && (

            <Modal autoFocus={false}  width={'80%'}  actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleModalClose },
              ]
            } onClose={this.handleModalClose} height={600} heading={(this.state.isNew ? "Add" : "Edit") + " Vendor"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                    <GridColumn medium={6}>
                        <Field name="company_name" defaultValue={this.state.modalData.company_name}
                              label="Company Name" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="company_email" defaultValue={this.state.modalData.email}
                              label="Company Email" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="owner_name" defaultValue={this.state.modalData.owner_name}
                              label="Owner Name" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="owner_phone" defaultValue={this.state.modalData.owner_phone}
                              label="Owner Phone" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="contact_name" defaultValue={this.state.modalData.contact_name}
                              label="Other Contact Name" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="contact_phone" defaultValue={this.state.modalData.contact_phone}
                              label="Other Contact Phone" 
                              >
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="address" defaultValue={this.state.modalData.address}
                              label="Address" 
                              >
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>

                    <GridColumn medium={3}>
                        <Field name="city" defaultValue={{ 'value': this.state.modalData.city, 'label': changeCase.titleCase(this.state.modalData.city) }}
                              label="City" 
                              isRequired>
                          {({ fieldProps }) => <Select options={this.state.cityOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>

                      <GridColumn medium={3}>
                        <Field name="state" defaultValue={{ 'value': this.state.modalData.state, 'label': changeCase.titleCase(this.state.modalData.state) }}
                              label="State" 
                              isRequired>
                          {({ fieldProps }) => <Select options={this.state.stateOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>


                    <GridColumn medium={4}>
                        <Field name="pincode" defaultValue={this.state.modalData.pincode}
                              label="Pincode" 
                              >
                          {({ fieldProps }) => <TextField 
                          type="number"
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    

                      <GridColumn medium={8}>
                        <Field name="source" defaultValue={{ 'value': this.state.modalData.source, 'label': changeCase.titleCase(this.state.modalData.source) }}
                              label="Source" 
                              isRequired>
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
)(Vendors);
