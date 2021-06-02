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

// Components
// import ContentWrapper from '../../../components/ContentWrapper';

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
    <rect x="0" y="15" rx="5" ry="5" width={400 * random} height="15" />
    <rect x="0" y="75" rx="5" ry="5" width="350" height="15" />
    <rect x="0" y="45" rx="5" ry="5" width={200 * random} height="15" />
  </ContentLoader>
);




// api url path
var url = "/v1/itemcats";

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

const deleteConfMessage = "Are you sure you want to delete the category? Please note that this will not delete any items but will remove category from all assigned items."
const deleteConfHeader = "Confirm Item Category Deletion"

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
      searchIcon: true,
      categoryValue: [],
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
      category: (this.state.categoryValue).map(x => x['value']).join(",")
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
    console.log(index)
    const categoryList = this.state.categoryOptions;
    const indexCat = categoryList.findIndex(x => x.value === data.category.value);
    console.log(indexCat)
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, 'post' ,{
          category: data.category.value,
          sub_category: data.sub_category,
          description: data.description
        }).then(response => {
          const { data, message, success } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });    
          if (success){
            if (indexCat === -1){
              this.setState({
                categoryOptions:[{'value':data.category,'label':changeCase.titleCase(data.category)},...this.state.categoryOptions]
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
          category: data.category.value,
          sub_category: data.sub_category,
          description: data.description,
        }).then(response => {
          const { data, message, success } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });    
          if (success){
            if (indexCat === -1){
              this.setState({
                categoryOptions:[{'value':data.category,'label':changeCase.titleCase(data.category)},...this.state.categoryOptions]
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
            categoryOptions: JSON.parse(JSON.stringify(filters.category)),
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


    let renderBodyElement = null;
    if (this.state.loaded === true) {
      renderBodyElement = null;
      renderBodyElement = this.state.data.map((row, key) => {
        return (
                <GridColumn key = {key} medium={2} className="item-grid">
                  <Link to={""}>
                      <div className="item-div">
                        <div className="item-div-internal">
                          <div className="item-image-container">
                            <img className="item-image" src={"https://thedecorshop.s3.ap-south-1.amazonaws.com/images/"+ (key+1) +".jpeg"}/>
                          </div>
                          <div className="item-name">
                            Item Name Item Name Item Name Item Name Item Name 
                          </div>
                        </div>  
                    </div>
                    </Link>
                </GridColumn>
        );
      });
    } else {
      renderBodyElement = loaderArray.map((row, key) => {
        return (
                <GridColumn key={key} medium={3} className="item-grid">
                    <div className="item-div">
                      <div className="item-image-container">
                        <img src={""}/>
                      </div>
                      <div className="item-name">
                        <MyTextLoader/>
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
      <div className="dashboard-page">
        <Grid layout="fluid">
                <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        </Grid>
        <Grid layout="fluid">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
            <Link to={'/adminpanel/items/add-item'}>
              <Button appearance="warning">
                Add Item
              </Button>
          </Link>
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
          <GridColumn medium={3}>
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
          <GridColumn medium={4}>
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
          
        <ModalTransition>
          {this.state.isModalOpen && (

            <Modal autoFocus={false}  actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleModalClose },
              ]
            } onClose={this.handleModalClose} height={475} heading={(this.state.isNew ? "Add" : "Edit") + " Item Category"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                    <GridColumn medium={12}>
                        <Field name="category" defaultValue={{ 'value': this.state.modalData.category, 'label': changeCase.titleCase(this.state.modalData.category) }}
                              label="Item Category" 
                              isRequired>
                          {({ fieldProps }) => <CreatableSelect options={this.state.categoryOptions} 
                          // placeholder="eg. Sentence Correction"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="sub_category" defaultValue={this.state.modalData.sub_category}
                              label="Sub Category" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="description"
                            defaultValue={this.state.modalData.description}
                            label="Category Description"                            
                            // isRequired
                            >
                          {({ fieldProps }) => <TextArea
                          minimumRows = {3} 
                          // placeholder="eg. Inference are topics which require xyz" 
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
)(ItemCategory);