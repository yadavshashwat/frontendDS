// React
import React, { Component } from 'react';
// import { Link } from 'react-router';
import Dropzone from 'react-dropzone'

// Styles
import "../../../css/dashboard.css"

// Backend Connection
import { api,imageHandlerApi } from "../../../helpers/api.jsx";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../../redux/actions/flag";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import { CheckboxSelect } from '@atlaskit/select';

//Icons
import pathIcon from "../../../routing/BreadCrumbIcons"

// Components

// Other Packages
var changeCase = require("change-case");


function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}

// api url path
var url_items = "/v1/items";
var url_category = "/v1/itemcats";
var url_vendor = "/v1/vendors";
var url_itemvendor = "/v1/itemvendors/";
var url_image_upload = "/v1/itemimageupload/";
var url_image_delete = "/v1/itemimagedelete/";
const loaderURL = "https://thedecorshop.s3.ap-south-1.amazonaws.com/web-images/loading-gifs/deadpool.gif"



class AddEditItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      isEdit:false,
      // form variables
      categoryOptions: [],
      categoryValue: [],
      vendorOptions: [],
      vendorValue: [],
      itemNameValue:"",     
      ItemDescriptionValue:"",
      ItemDimensionsValue:"",
      ItemSellingPrice:"",
      ItemSellingPriceValid:true,
      ImageList:[],
      UploadedImages:[],
      itemID: "",
      isVendorAdd:false,
    };
    this.defaultState = this.state;

  }

  


  handleItemNameChange = event => {
    var data = event.target.value
    this.setState({ itemNameValue: data});
  };

  handleItemDimensionsChange = event => {
    var data = event.target.value
    this.setState({ ItemDimensionsValue: data});
  };

  handleItemDescriptionChange = event => {
    var data = event.target.value
    this.setState({ ItemDescriptionValue: data});
  };

  
  handleSellingPriceChange = event => {
    var data = event.target.value
    if (data >= 0) {
      this.setState({
        ItemSellingPrice: data,
        ItemSellingPriceValid: true
      });
    } else {
      this.setState({
        ItemSellingPrice: "",
        ItemSellingPriceValid: false
      });
    }
  };

  handleFileDrop = acceptedFiles => {
    const currentState = this.state.ImageList
    for(var i = 0; i < acceptedFiles.length ; i += 1) {
      var indexFile = currentState.findIndex(x => x.path === acceptedFiles[i].path);
      if(indexFile < 0 ){
        currentState.push(acceptedFiles[i])
      }
    }
    this.setState({
      ImageList:currentState
    })
  }

  handleImageRemoveClick = event =>{
    const path = event.currentTarget.dataset.id
    // console.log(path)
    var currentState = this.state.ImageList
    var indexFile = currentState.findIndex(x => x.path === path);
    this.setState({ImageList: [
        ...currentState.slice(0, indexFile),
        ...currentState.slice(indexFile + 1)
      ]
    })
    
  }
  

  handleImageDeleteClick = event =>{
    const dataId = event.currentTarget.dataset.id
    var currentState = this.state.UploadedImages
    var indexFile = currentState.findIndex(x => x.id === parseInt(dataId));
    
    api(url_image_delete  + dataId, 'delete' ,{}).then(response => {
    const { message, success } = response;
    this.props.actions.addFlag({
      message: message,
      appearance: (success ? "warning" :  "danger")
    });    
    if (success){
      this.setState({UploadedImages: [
        ...currentState.slice(0, indexFile),
        ...currentState.slice(indexFile + 1)
      ]
    });
    }
  })
  .catch(error => console.log(error))
}
    // // console.log(path)
    // var currentState = this.state.ImageList
    // var indexFile = currentState.findIndex(x => x.path === path);
    // this.setState({ImageList: [
    //     ...currentState.slice(0, indexFile),
    //     ...currentState.slice(indexFile + 1)
    //   ]
    // })
    

// handleCategoryChange = 

handleVendorChange = value => {
  // const data = (value).map(x => x['value']).join(",");
  this.setState({ vendorValue: value});
};


  handleCategoryChange = value => {
    this.setState({ categoryValue: value })
    

  }

  handleSaveItem = () =>{
    this.SaveItem('save');
  }

handleSaveContinueItems = () =>{
    this.SaveItem('continue');
}


handleEditItem = () => {
  // console.log('here')
  const submitCheck = this.checkError();
  this.setState({
    loaded:false
  })
  if (submitCheck){
  const payloadSend = {
      name: this.state.itemNameValue,
      category: this.state.categoryValue ? this.state.categoryValue.value : '',
      description: this.state.ItemDescriptionValue,
      dimensions: this.state.ItemDimensionsValue,
      sell_price: this.state.ItemSellingPrice,
      vendorlist : this.state.vendorValue.map(x => x['value']).join(",")
    }
  // console.log(payloadSend)
  api(url_items + '/' + this.state.itemID, 'put' ,payloadSend)
  .then(response => {
    const { data, message, success } = response;
    var updatedMessage = message
    if (this.state.ImageList.length > 0){
      updatedMessage = message + " Uploading Images"
    }
    this.props.actions.addFlag({
      message: updatedMessage,
      appearance: (success ? "warning" :  "danger")
    });    
    if (success){
      const formData = new FormData();
      for(var i = 0; i < this.state.ImageList.length ; i += 1) {
        formData.append("file", this.state.ImageList[i]);          
      }
      if (this.state.ImageList.length > 0){
        imageHandlerApi(url_image_upload + data.id ,formData)
        .then(response => {
          const {data, message, success } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (success ? "warning" :  "danger")
          });   

        if (success){
          this.setState({
            ImageList:[],
            loaded:true ,
            UploadedImages:[...this.state.UploadedImages,...data]             
          });
          }
        }).catch(error => console.log(error))

      }else{
        this.setState({
          ImageList:[],
          loaded:true,   
          UploadedImages:[...this.state.UploadedImages,...data]             
        });
      }
    }
  })
  .catch(error => console.log(error))
}
};    

  checkError = () => {
    var noError = true
    var errorMessage = ""
    console.log('check')
    if (this.state.itemNameValue === ""){
        noError = false;
        errorMessage = "Missing Item Name!"
    }

    if (!noError){
        this.props.actions.addFlag({
            message: errorMessage,
            appearance: "warning"
          });        
    }
    return noError
}

  SaveItem = (type) => {
    // console.log('here')
    const submitCheck = this.checkError();
    this.setState({
      loaded:false
    })
    if (submitCheck){
    const payloadSend = {
        name: this.state.itemNameValue,
        category: this.state.categoryValue ? this.state.categoryValue.value : '',
        description: this.state.ItemDescriptionValue,
        dimensions: this.state.ItemDimensionsValue,
        sell_price: this.state.ItemSellingPrice,
        vendorlist : this.state.vendorValue.map(x => x['value']).join(",")
      }
    // console.log(payloadSend)
    api(url_items, 'post' ,payloadSend)
    .then(response => {
      const { data, message, success } = response;
      var updatedMessage = message
      if (this.state.ImageList.length > 0){
        updatedMessage = message + " Uploading Images"
      }
      this.props.actions.addFlag({
        message: updatedMessage,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
 
        const formData = new FormData();
        for(var i = 0; i < this.state.ImageList.length ; i += 1) {
          formData.append("file", this.state.ImageList[i]);          
        }
        if (this.state.ImageList.length > 0){
          imageHandlerApi(url_image_upload + data.id ,formData)
          .then(response => {
            const { message, success } = response;
            this.props.actions.addFlag({
              message: message,
              appearance: (success ? "warning" :  "danger")
            });   
          if (success){
            if(type==="save"){    
              this.setState({
                itemNameValue:"",     
                ItemDescriptionValue:"",
                ItemDimensionsValue:"",
                ItemSellingPrice:"",
                ItemSellingPriceValid:true,
                categoryValue:"",
                vendorValue:[],
                ImageList:[],
                loaded:true              
              });
              console.log('here')
  
              
            }else{
              this.setState({
                itemNameValue:"",     
                ItemDescriptionValue:"",
                ItemDimensionsValue:"",
                ItemSellingPrice:"",
                ItemSellingPriceValid:true,
                ImageList:[],
                loaded:true                            
              });
              console.log('here1')
            } 
          }else{
            this.setState({
              loaded:true
            })
          }
          }).catch(error => console.log(error))

        }else{
          if(type==="save"){    
            this.setState({
              itemNameValue:"",     
              ItemDescriptionValue:"",
              ItemDimensionsValue:"",
              ItemSellingPrice:"",
              ItemSellingPriceValid:true,
              vendorValue:[],
              categoryValue:"",
              ImageList:[],
              loaded:true              
            });            
          }else{
            this.setState({
              itemNameValue:"",     
              ItemDescriptionValue:"",
              ItemDimensionsValue:"",
              ItemSellingPrice:"",
              ItemSellingPriceValid:true,
              ImageList:[],
              loaded:true                            
            });
          } 
        }
      }else{
        this.setState({
          loaded:true
        })
      }
    })
    .catch(error => console.log(error))
  }else{
    this.setState({
      loaded:true
    })
  }
};    


  // On Load
  componentDidMount() {
    var Path = window.location.pathname.split("/")
    var edit = false
    var itemID = Path[3]
    var vendorAdd = false
    if(Path[4] === "edit-item"){
      this.setState({
        isEdit:true,
        itemID: itemID
      })
      edit = true
    } else if (Path[4]==="add-item" && Path[2]=== "vendors") {
      this.setState({
        isVendorAdd:true
      })
      vendorAdd = true
    } 

    // console.log(Path[3],Path[4],itemID)
    if (edit){
      api(url_items + '/' + itemID, 'get', {}).then(response => {
        const { data, success } = response;
        if (success) {
          this.setState(
            {
              categoryValue: data.category_details ? {'value':data.category_details.id,'label':titleCase(data.category_details.category + ' - '+ data.category_details.sub_category)}:"",
              itemNameValue:data.name,     
              ItemDescriptionValue:data.description,
              ItemDimensionsValue:data.dimensions,
              ItemSellingPrice:data.sell_price,
              UploadedImages:data.image_details
            }
          );

          let filtersData =  {  is_all: 1 }
          api(url_category, 'get', filtersData).then(response => {
            const { data, success } = response;
            if (success) {
              var categoryOptions = []        
              var updatedData = JSON.parse(JSON.stringify(data));
              for(var i = 0; i < updatedData.length ; i += 1) {
                  var value = updatedData[i]['id']
                  var label = titleCase(updatedData[i]['category'] + ' - ' +updatedData[i]['sub_category'])
                  categoryOptions.push({'value':value,'label':label})
              }
              this.setState(
                {
                  categoryOptions: categoryOptions,
                }
              );
              api(url_vendor, 'get', filtersData).then(response => {
                const { data, success } = response;
                if (success){
                  var vendorOptions = []        
                  var updatedData = JSON.parse(JSON.stringify(data));
                  
                  for(var i = 0; i < updatedData.length ; i += 1) {
                      var value = updatedData[i]['id']
                      var label = titleCase(updatedData[i]['company_name'])
                      vendorOptions.push({'value':value,'label':label})
                  }
                  this.setState(
                    {
                      vendorOptions: vendorOptions,
                    }
                  );  

                  api(url_itemvendor + itemID, 'get', {}).then(response => {
                    const { data, success } = response;
                    if(success){
                      var selectedVendors = []        
                      var updatedData = JSON.parse(JSON.stringify(data));
                      for(var i = 0; i < updatedData.length ; i += 1) {
                          var value = updatedData[i]['vendor_details']['id']
                          var label = titleCase(updatedData[i]['vendor_details']['company_name'])
                          selectedVendors.push({'value':value,'label':label})
                      }
                      this.setState(
                        {
                          loaded: true,
                          vendorValue: selectedVendors,
                        }
                      );
    

                    }});


                }});


            }
          });
        }
      });
    }else{
      let filtersData =  {  is_all: 1 }
      api(url_category, 'get', filtersData).then(response => {
        const { data, success } = response;
        if (success) {
          var categoryOptions = []        
          var updatedData = JSON.parse(JSON.stringify(data));
          var selectedVendor = []
          for(var i = 0; i < updatedData.length ; i += 1) {
              var value = updatedData[i]['id']
              var label = titleCase(updatedData[i]['category'] + ' - ' +updatedData[i]['sub_category'])
              categoryOptions.push({'value':value,'label':label})
          }
          this.setState(
            {
              categoryOptions: categoryOptions,
            }
          );
          api(url_vendor, 'get', filtersData).then(response => {
            const { data, success } = response;
            if (success){
              var vendorOptions = []        
              var updatedData = JSON.parse(JSON.stringify(data));
              for(var i = 0; i < updatedData.length ; i += 1) {
                  var value = updatedData[i]['id']
                  var label = titleCase(updatedData[i]['company_name'])
                  vendorOptions.push({'value':value,'label':label})
                  if (vendorAdd && updatedData[i]['id'] == parseInt(Path[3])){
                    selectedVendor = [{'value':value,'label':label}]
                  }

              }
              if (vendorAdd){
                this.setState(
                  {
                    vendorOptions: vendorOptions,
                    vendorValue:selectedVendor,
                    loaded: true
                  }
                );  
              }else{
                this.setState(
                  {
                    vendorOptions: vendorOptions,
                    loaded: true
                  }
                );  
              }
          
            }});

        
        
        }
      });
  
    }
  }


  render() {

    let renderImageElement = null;
    
    renderImageElement = this.state.ImageList.map((row, key) => {
    return (
            <GridColumn key = {key} medium={1} className="item-grid">
                  <div className="image-div">
                    <div className="image-div-internal">
                      <div className="image-image-container">
                        <img className="image-image" src={ URL.createObjectURL(row)}/>
                      </div>
                      <div data-id={row.path}  className="remove-image" onClick={this.handleImageRemoveClick}>
                        Remove
                      </div>
                    </div>  
                </div>
            </GridColumn>
    );
  });
    
  let renderUploadedImageElement = null;
    
  renderUploadedImageElement = this.state.UploadedImages.map((row, key) => {
  return (
          <GridColumn key = {key} medium={1} className="item-grid">
                <div className="image-div">
                  <div className="image-div-internal">
                    <div className="image-image-container">
                      <img className="image-image" src={row.path}/>
                    </div>
                    <div data-id={row.id}  className="delete-image" onClick={this.handleImageDeleteClick}>
                      Delete
                    </div>
                  </div>  
              </div>
          </GridColumn>
  );
});


    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    breadCrumbElement = Path.map((row, index) => {
      if (index > 1 && index < (Path.length)){
        if(this.state.isEdit){
          if(index === 3){
            var textPath = changeCase.titleCase(this.state.itemNameValue)              
          }else{
            var textPath = changeCase.titleCase(Path[index])
          }  
        }else{

          if(index === 3){
            if (Path[2] === "vendors"){
              console.log(Path[2])
              var textPath = changeCase.titleCase(this.state.vendorValue.length > 0 ? this.state.vendorValue[0].label : "")  
            }else{
              var textPath = changeCase.titleCase(Path[index])
            }
          }else{
            var textPath = changeCase.titleCase(Path[index])
          }  
          // var textPath = changeCase.titleCase(Path[index])
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
        <br></br>
        <Grid layout="fluid">
          <h2>{this.state.isEdit ? "Edit": "Add"} Item</h2>
        </Grid>
        <Grid layout="fluid">
          <GridColumn medium={6}>
              <div className="field-div">
                  <span className="field-label">Item Name<span className="is-required">*</span></span>
                    <TextField 
                        placeholder="Metal Vase etc."
                        name="ItemName" 
                        label="Item Name" 
                        onChange={this.handleItemNameChange}
                        value={this.state.itemNameValue}
                        />
              </div>
          </GridColumn>
          <GridColumn medium={6}>
              <div className="field-div">
                    <span className="field-label">Item Category</span>
                      <Select
                        name="folderValue"
                        options={this.state.categoryOptions}
                        // placeholder="CAT QBank 1..."
                        onChange={this.handleCategoryChange}
                        value= {this.state.categoryValue}
                      />
                </div>          
            </GridColumn>
            <GridColumn medium={6}>
              <div className="field-div">
                  <span className="field-label">Item Dimensions</span>
                    <TextField 
                        placeholder="10 X 10 X 10 etc."
                        name="ItemName" 
                        label="Item Name" 
                        onChange={this.handleItemDimensionsChange}
                        value={this.state.ItemDimensionsValue}
                        />
              </div>
          </GridColumn>
          <GridColumn medium={6}>
              <div className="field-div">
                  <span className="field-label">Selling Price (INR)</span>
                    <TextField 
                        placeholder="500, 1000 etc."
                        name="ItemName" 
                        label="Item Name" 
                        type="number"
                        onChange={this.handleSellingPriceChange}
                        value={this.state.ItemSellingPrice}
                        />
              </div>
          </GridColumn>


            <GridColumn medium={12}>
              <div className="field-div">
                  <span className="field-label">Item Description</span>
                    <TextArea 
                        placeholder="bronze piece etc."
                        name="ItemDescription" 
                        label="Item Name" 
                        minimumRows={3}
                        onChange={this.handleItemDescriptionChange}
                        value={this.state.ItemDescriptionValue}
                        />
              </div>
          </GridColumn>

          <GridColumn medium={12}>
            <div className="field-div">
                <span className="field-label">Vendors</span>
                <CheckboxSelect
                  className="checkbox-select"
                  classNamePrefix="select"
                  options={this.state.vendorOptions}
                  placeholder="Vendors"
                  isDisabled={this.state.isVendorAdd}
                  onChange={this.handleVendorChange}
                  value={this.state.vendorValue}
                />
              </div>
          </GridColumn>


          <GridColumn medium={12}>
          <div className="field-div">
                <span className="field-label">Item Images</span>
                <Dropzone 
                  onDrop={acceptedFiles => this.handleFileDrop(acceptedFiles)}
                  accept='image/jpeg, image/png'
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
          </GridColumn>
          {(this.state.ImageList.length > 0)  && (
            <div className="image-list">
            {renderImageElement}  
            </div>
          )}
          <GridColumn medium={12}>
          {(this.state.isEdit)  && (
              <div className="button-row">
              <div className="button-container">
                <Button isDisabled={!this.state.loaded} onClick={this.handleEditItem.bind(this)} appearance="warning">Update</Button>
              </div>
            </div>
          )}
          {(!this.state.isEdit && !this.state.isVendorAdd)  && (
              <div className="button-row">
              <div className="button-container">
                <Button isDisabled={!this.state.loaded} onClick={this.handleSaveItem.bind(this)} appearance="warning">Add</Button>
              </div>
              <div className="button-container">
                <Button isDisabled={!this.state.loaded} onClick={this.handleSaveContinueItems.bind(this)} appearance="warning">Add and Continue</Button>
              </div>
            </div>

          )}
          {(!this.state.isEdit && this.state.isVendorAdd)  && (
              <div className="button-row">
              <div className="button-container">
                <Button isDisabled={!this.state.loaded} onClick={this.handleSaveContinueItems.bind(this)} appearance="warning">Add</Button>
              </div>
            </div>

          )}

          </GridColumn>
          <GridColumn medium={12}>
          {(this.state.UploadedImages.length > 0 && this.state.isEdit)  && (
            <div className="field-div">
              <span className="field-label">Current Images</span>
              <div className="image-list">
                {renderUploadedImageElement}  
              </div>
            </div>
          )}
          </GridColumn>
        </Grid>
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
)(AddEditItem);
