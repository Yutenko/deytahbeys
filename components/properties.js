import React from 'react'
import update from 'react-addons-update'

import emitter from '../emitter/emitter'
import {purple600,cyan500,yellow500} from 'material-ui/styles/colors'
import Dialog from 'material-ui/Dialog'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Deytah from './deytah'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import Helper from './helper'
import TextField from 'material-ui/TextField'
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system'
import Chip from 'material-ui/Chip'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

var styles = {
 deytahPos: {
  position:"absolute",
  top:0,
  right:0,
  marginTop:0,
  width:50,
  height:50
 },
 chip:{
  margin:4
 },
 chipWrapper:{
  display:'flex',
  flexWrap:'wrap',
  paddingTop:12,
  paddingBottom:12
 },
 dbHeadHello:{
  position:"absolute",
  width:200,
  top:-100,
  right:50,
  zIndex:-1
 },
}

var Properties = React.createClass({

 getInitialState: function () {
  return {
   database:'',
   open:false,
   visible:false,
   properties:{
    a:"Name",
    aType:'text',
    b:"",
    bType:'text',
    c:"",
    cType:'text',
    d:"",
    dType:'text'
   }
  }
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_PROPERTIES, function (obj) {
   if (obj.properties && obj.database)
    this.setState({properties:obj.properties,database:obj.database})

   else if (obj.properties)
    this.setState({properties:obj.properties})

   else if (obj.database)
    this.setState({database:obj.database})


   this.showMe()
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_PROPERTIES)
 },

 showMe: function () {
  this.setState({visible:true})
 },

 addProperty: function (key,value) {
  var shortid = Helper.getHashValue('db')
  var newData = update(this.state,{properties:{[key]:{$set: value}}})

  firebase.database().ref('dbs/'+shortid+'/properties').set(newData.properties,function () {
   this.setState(newData)
  }.bind(this))
 },

 hasEmptyProperties: function () {
  return this.state.properties.b === '' || this.state.properties.c === '' || this.state.properties.d === ''
 },

 allEmpty: function () {
  return this.state.properties.b === '' && this.state.properties.c === '' && this.state.properties.d === ''
 },

 handleClick: function () {
  if (!this.hasEmptyProperties()) {
   this.handleClose()
   emitter.emit(emitter.MESSAGE.SHOW_DATATBASEITEMS_CONTAINER,{properties:this.state.properties,database:this.state.database})
   emitter.emit(emitter.MESSAGE.SHOW_SHARING,{popDialog:false})
  }
 },

 getType: function (type) {
  if (type === 'text') return "Text"
  if (type === 'number') return "Zahl"
  if (type === 'boolean') return "Ja/Nein"

  return ''
 },

 getPropertyChip: function (property,type) {
  return <Chip backgroundColor={purple600} style={styles.chip}> {property} : <span style={{color:yellow500}}> {this.getType(type)} </span> </Chip>
 },

 render: function () {
  var output = null
  var properties = null
  var action = null

  if ((!this.hasEmptyProperties() || this.state.open) && this.state.visible) {
    action = <IconButton onClick={this.handleOpen} ><FontIcon className="material-icons">mode_edit</FontIcon></IconButton>
   } else {
    action = <Deytah style={styles.deytahPos} handleClick={this.handleOpen} />
   }

  if (this.allEmpty()) {
   properties = "Eigenschaften"
  } else {
   properties = <div style={styles.chipWrapper}>
    {this.state.properties.a !== "" ? this.getPropertyChip(this.state.properties.a,this.state.properties.aType) : ''}
    {this.state.properties.b !== "" ? this.getPropertyChip(this.state.properties.b,this.state.properties.bType) : ''}
    {this.state.properties.c !== "" ? this.getPropertyChip(this.state.properties.c,this.state.properties.cType) : ''}
    {this.state.properties.d !== "" ? this.getPropertyChip(this.state.properties.d,this.state.properties.dType) : ''}
   </div>
  }

  output = <AppBar
   style={this.state.visible ? {visibility:"visible",backgroundColor:cyan500,paddingLeft:5} : {visibility:"hidden",backgroundColor:cyan500,paddingLeft:5}}
   title={properties}
   showMenuIconButton={false}
   iconElementRight={
    action
   }
  >
    <Dialog
     title="Eigenschaften"
     modal={true}
     open={this.state.open}
     onRequestClose={this.handleClose}
     autoScrollBodyContent={true}
     actions={
      <FlatButton
       label="OK"
       primary={true}
       onTouchTap={this.handleClick}
      />
     }
    >
     <PropertyEdit properties={this.state.properties} addProperty={this.addProperty} database={this.state.database}/>
    </Dialog>
  </AppBar>

  return (output)
 }

})

var PropertyEdit = React.createClass({

 render: function () {
  return (
   <div>
    <p> Deine Sammlung {this.props.database} hat sicher gemeinsame Eigenschaften. Zum Beispiel das Alter der Personen oder Farbe des Gegenstandes usw. Die Eigenschaft <span style={{color:"white"}}> Name </span>  gebe ich Dir vor. Ergänze die fehlenden Felder (b,c und d) mit Deinen eigenen Eigenschaften</p>

   <div style={{textAlign:"center"}}>
    <img src="client/images/db_head_hello.png" style={styles.dbHeadHello} />
    <Property disabled={true}  value={this.props.properties.a} addProperty={this.props.addProperty} index="a" type={this.props.properties.aType} />
    <Property disabled={false} value={this.props.properties.b} addProperty={this.props.addProperty} index="b" type={this.props.properties.bType}/>
    <Property disabled={false} value={this.props.properties.c} addProperty={this.props.addProperty} index="c" type={this.props.properties.cType}/>
    <Property disabled={false} value={this.props.properties.d} addProperty={this.props.addProperty} index="d" type={this.props.properties.dType}/>
   </div>

   </div>
  )
 }

})


var Property = React.createClass({

 getInitialState: function () {
  return {defaultValue:this.props.type}
 },

 onChangeTextField: function (e,value) {
  this.props.addProperty(this.props.index,value)
 },

 onChangeTypeField: function (e,i,v) {
  this.setState({defaultValue:v})
  var key = this.props.index + 'Type'
  this.props.addProperty(key,v)
 },

 getType: function (type) {
  if (type === 'text') return "Text"
  if (type === 'number') return "Zahl"
  if (type === 'boolean') return "Ja/Nein"

  return ''
 },

 render: function () {
  return (
   <Col xs={12} md={6} lg={6}>
    <TextField
     floatingLabelText={this.props.index}
     disabled={this.props.disabled}
     defaultValue={this.props.value}
     onChange={this.onChangeTextField}
    />
    {this.props.index !== "a" &&
     <DropDownMenu value={this.state.defaultValue} onChange={this.onChangeTypeField} style={{width:"100%"}}>
      <MenuItem value='text' primaryText="Text" />
      <MenuItem value='number' primaryText="Zahl" />
      <MenuItem value='boolean' primaryText="Ja/Nein" />
     </DropDownMenu>
    }
    {this.props.index === "a" &&
     <TextField
      disabled={this.props.disabled}
      defaultValue="Text"
     />
    }
   </Col>
  )
 }

})




export default Properties
