import React from 'react'

import { Container, Row, Col, Visible, Hidden } from 'react-grid-system'
import Paper from 'material-ui/Paper'
import FontIcon from 'material-ui/FontIcon'
import TextField from 'material-ui/TextField'
import DropzoneComponent from 'react-dropzone-component'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Helper from './helper'
import IconButton from 'material-ui/IconButton'
import {List, ListItem} from 'material-ui/List'
import Toggle from 'material-ui/Toggle'
import Deytah from './deytah'
import {red600,green600} from 'material-ui/styles/colors'


require('../node_modules/dropzone/dist/min/dropzone.min.css')

var styles = {
 paper:{
  position:"relative",
  width:"100%",
  height:300,
  marginBottom:30
 },
 cardProperties:{
  position:"absolute",
  height:"100%",
  overflow:"hidden",
  display:"block",
  left:"30%",
  top:0,
  width:"70%"
 },
 textfield:{
  width:"90%",
  paddingLeft:10
 },
 deytahPos:{
  position:"relative",
  top:"43%",
  left:"38%",
  zIndex:999,
  width:50,
  height:50
 },
 deleteMeBtn:{
  position:"absolute",
  right:0,
  zIndex:999
 },
 dbHead:{
  position:"absolute",
  width:200,
  left:0,
  right:0,
  marginLeft:"auto",
  marginRight:"auto",
  top:-65,
  zIndex:-1
 },
 dbLeftArm:{
  position:"absolute",
  width:75,
  left:-44,
  top:"32%"
 },
 dbRightArm:{
  position:"absolute",
  width:75,
  top:"32%",
  right:-45
 }
}


var DatabaseItem = React.createClass({

 getInitialState: function () {
  return {open:false}
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 storeImage: function (storagePath) {
  var shortid = Helper.getHashValue('db')

  firebase.database().ref('dbs/'+shortid+'/items/'+this.props.id+'/img').set(storagePath,function () {
   this.props.updateDatabaseItemImg(this.props.id,storagePath)
  }.bind(this))
 },

 hasExpectedValueTyp: function (key,value) {
  const type = this.props.properties[key+"Type"]
  if (type === 'text') {
   return !(/^\d+$/.test(value))
  }
  else if (type === 'number') {
   return /^\d+$/.test(value)
  }
  else if (type === 'boolean') {
   return value === 'true' || value === 1 || value === true || value === 'false' || value === 0 || value === false
  }
 },

 propertyChanged: function (key,value) {
  if (this.hasExpectedValueTyp(key,value) || value === "") {
    var shortid = Helper.getHashValue('db')
    firebase.database().ref('dbs/'+shortid+'/items/'+this.props.id+'/'+key).set(value)
    this.props.updateDatabaseItemProperty(this.props.id,key,value)
  } else console.log('value did not match the expected type');
 },

 deleteMe: function () {
  var shortid = Helper.getHashValue('db')
  // remove from storage

  firebase.storage().ref('dbs/'+shortid+'/img:'+this.props.id).delete().then(function () {
   console.log('deleted from storage')
  }).catch(function (error) {

  })
  // remove from reference
  firebase.database().ref('dbs/'+shortid+'/items/'+this.props.id).remove()
  this.props.deleteDatabaseItem(this.props.id)
 },

 getPaperShadow: function () {
  var paperShadow = ''
  const value = this.props.item
  if (value) {
    const aType = this.props.properties["aType"]
    const bType = this.props.properties["bType"]
    const cType = this.props.properties["cType"]
    const dType = this.props.properties["dType"]

    let aValue, bValue, cValue, dValue

    // test a
    if (aType === 'boolean') {
      if (value.a === true || value.a === false) aValue = true
    } else {
      if (value.a !== '') aValue = true
    }
    // test b
    if (bType === 'boolean') {
      if (value.b === true || value.b === false) bValue = true
    } else {
      if (value.b !== '') bValue = true
    }
    // test c
    if (cType === 'boolean') {
      if (value.c === true || value.c === false) cValue = true
    } else {
      if (value.c !== '') cValue = true
    }
    // test d
    if (dType === 'boolean') {
      if (value.d === true || value.d === false) dValue = true
    } else {
      if (value.d!== '') aValue = true
    }

    if (aType && bType && cType && dType && value.img !== '') {
     paperShadow = "animated jello";
   } else paperShadow = "unfinishedItem animated jello"
  }

  return paperShadow
 },

 getBackgroundImage: function () {
  var backgroundImage = ""
  if (this.props.item && this.props.item.img)
   backgroundImage = this.props.item.img

  return backgroundImage
 },

 render: function () {
  var output = null

  if (this.props.item) {
   output = <Paper zDepth={4} style={styles.paper} className={this.getPaperShadow()}>

    <IconButton onTouchTap={this.deleteMe} style={styles.deleteMeBtn}>
     <FontIcon className="material-icons">clear</FontIcon>
    </IconButton>

    <div className="cardImg" style={{backgroundImage:"url("+this.getBackgroundImage()+")"}} onTouchTap={this.handleOpen}>
     {this.props.item.img === '' && <Deytah style={styles.deytahPos} handleClick={this.handleOpen}/>}
     {this.props.item.img === '' && <p style={{marginTop:150,textAlign:"center",cursor:"pointer"}}> Bild wählen </p>}
	   <Dialog
      title="Bild hochladen"
      modal={true}
      open={this.state.open}
      onRequestClose={this.handleClose}
      actions={
       <FlatButton
        label="Abbrechen"
        primary={true}
        onTouchTap={this.handleClose}
       />
      }
     >
      <ImageUploader id={this.props.id} close={this.handleClose} storeImage={this.storeImage}/>
     </Dialog>
	</div>
    <div style={styles.cardProperties}>
     <PropertyField
      index="a"
      keyName={this.props.properties.a}
      value={this.props.item.a}
      style={styles.textfield}
      properties={this.props.properties}
      propertyChanged={this.propertyChanged}
     />
     <PropertyField
      index="b"
      keyName={this.props.properties.b}
      value={this.props.item.b}
      style={styles.textfield}
      properties={this.props.properties}
      propertyChanged={this.propertyChanged}
     />
     <PropertyField
      index="c"
      keyName={this.props.properties.c}
      value={this.props.item.c}
      style={styles.textfield}
      properties={this.props.properties}
      propertyChanged={this.propertyChanged}
     />
     <PropertyField
      index="d"
      keyName={this.props.properties.d}
      value={this.props.item.d}
      style={styles.textfield}
      properties={this.props.properties}
      propertyChanged={this.propertyChanged}
     />

    </div>
   </Paper>
  }

  return (output)
 }


})


var PropertyField = React.createClass({

 onPropertyChange: function (e,value) {
  this.props.propertyChanged(this.props.index,value)
 },

 render: function () {
  const type = this.props.properties[this.props.index+"Type"]

  let field =
   <TextField
    floatingLabelText={this.props.keyName}
    value={this.props.value}
    style={this.props.style}
    onChange={this.onPropertyChange}
    id={Math.random().toString()}
   />

   if (type === 'boolean') {
    const value = this.props.value
    const toggled = value === 'true' || value === 1 || value === true ? true : false
    field =
     <List>
       <ListItem
        primaryText={this.props.keyName}
        rightToggle={
         <Toggle
          defaultToggled={toggled}
          onToggle={this.onPropertyChange}
          id={Math.random().toString()}
         />
        }
       />
     </List>
  }


  return (field)
 }

})



var ImageUploader = React.createClass({

 fileAdded: function (file) {
  var shortid = Helper.getHashValue('db')
  var storageRef = firebase.storage().ref('dbs/'+shortid+'/img:'+this.props.id)

  storageRef.put(file).then(function(snapshot) {
   this.props.storeImage(snapshot.downloadURL)
   this.props.close()
  }.bind(this))
 },

 pasteURL: function (e,value) {
  this.props.storeImage(value)
  this.props.close()
 },

 render: function () {
  var componentConfig = {
   postUrl: 'no-url'
  }

  var djsConfig = {
   autoProcessQueue: true,
   addRemoveLinks: false,
   multiple: false,
   dictDefaultMessage:"Drücke hier oder ziehe ein Bild (lokal) hinein"
  }

  var eventHandlers = {
   addedfile: this.fileAdded,
   success: this.fileSuccess,
   removedfile: this.fileRemoved
  }

  return (
   <div>
    <img src="client/images/db_head.png" style={styles.dbHead} />
    <img src="client/images/db_left_arm.png" style={styles.dbLeftArm} />
    <img src="client/images/db_right_arm.png" style={styles.dbRightArm} />

    <p> Lade hier ein Bild hoch oder verlinke es von einer Quelle im Internet </p>

    <DropzoneComponent
  	 config={componentConfig}
     eventHandlers={eventHandlers}
     djsConfig={djsConfig}
	/>
    <p style={{textAlign:"center",marginTop:40}}> ODER </p>
    <TextField
     hintText="URL zu einem Bild"
     onChange={this.pasteURL}
     fullWidth={true}
    />
   </div>
  )
 }

})



export default DatabaseItem
