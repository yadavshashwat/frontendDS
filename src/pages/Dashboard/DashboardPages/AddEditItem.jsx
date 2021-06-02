// React
import React, { Component } from 'react';
// import { Link } from 'react-router';
import Dropzone from 'react-dropzone'

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
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';


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




class AddEditItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      // form variables
      categoryOptions: [],
      categoryValue: [],
      itemNameValue:"",     
      ItemDescriptionValue:"",
      ItemDimensionsValue:"",
      ItemSellingPrice:"",
      ItemSellingPriceValid:true,
      ImageList:[]
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
    var currentState = this.state.ImageList
    for(var i = 0; i < acceptedFiles.length ; i += 1) {
      var indexFile = currentState.findIndex(x => x.path === acceptedFiles[i].path);
      if(indexFile < 0 ){
        currentState.push(acceptedFiles[i])
      }
    }
    this.setState({
      ImageList:currentState
    })
    console.log(this.state.ImageList)
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
  

  handleCategoryChange = value => {
    this.setState({ categoryValue: value })
    

  }

  handleSaveItem = () =>{
    this.SaveItem('save');
  }

handleSaveContinueItems = () =>{
    this.SaveItem('continue');
}


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
    console.log('here')
    const submitCheck = this.checkError();
    if (submitCheck){
    const payloadSend = {
        name: this.state.itemNameValue,
        category: this.state.categoryValue ? this.state.categoryValue.value : '',
        description: this.state.ItemDescriptionValue,
        dimensions: this.state.ItemDimensionsValue,
        sell_price: this.state.ItemSellingPrice,
      }
    console.log(payloadSend)
    api(url_items, 'post' ,payloadSend)
    .then(response => {
      const { message, success } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (success ? "warning" :  "danger")
      });    
      if (success){
          if(type==="save"){    

            
          }else{
            this.setState({
              itemNameValue:"",     
              ItemDescriptionValue:"",
              ItemDimensionsValue:"",
              ItemSellingPrice:"",
              ItemSellingPriceValid:true,
              ImageList:[]              
            });
          } 
      }
    })
    .catch(error => console.log(error))
  }
};    


  // On Load
  componentDidMount() {
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
            loaded: true,
            categoryOptions: categoryOptions,
          }
        );
      }
    });
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

    return (
      <div className="dashboard-page">
        <Grid layout="fluid">
                <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        </Grid>
        <br></br>
        <Grid layout="fluid">
          <h2>Add Item</h2>
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
                        value={this.state.ItemNameValue}
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
              <div className="button-row">
                <div className="button-container">
                  <Button onClick={this.handleSaveItem.bind(this)} appearance="warning">Add</Button>
                </div>
                <div className="button-container">
                  <Button onClick={this.handleSaveContinueItems.bind(this)} appearance="warning">Add and Continue</Button>
                </div>
              </div>
          </GridColumn>
        </Grid>
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
