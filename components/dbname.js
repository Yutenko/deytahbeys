import React from 'react'

import AppBar from 'material-ui/AppBar'
import Dialog from 'material-ui/Dialog'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import Avatar from 'material-ui/Avatar'
import {cyan500} from 'material-ui/styles/colors'

import emitter from '../emitter/emitter'
import Helper from './helper'
import Deytah from './deytah'


var styles = {
 deytahPos:{
  width:50,
  height:50,
  position:"absolute",
  right:7,
  top:7,
  marginTop:0
 },
 nameWrapper:{
  position:"relative"
 },
 nameImg:{
  width:"85%",
  display:"block",
  margin:"0 auto"
 },
 nameInput:{
  position:"absolute",
  bottom:"10%",
  width:"55%",
  left:"29%"
 },
}

var DbName = React.createClass({

 getInitialState: function () {
  return {open:false,visible:false,name:'',preview:'client/images/database.png'}
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 addDbName: function (dbName) {
  var shortid = Helper.getHashValue('db')
  firebase.database().ref('dbs/'+shortid+'/name').set(dbName)

  // only if the name wasn't set before
  if (this.state.name === '')
   emitter.emit(emitter.MESSAGE.SHOW_SHARING,{popDialog:true})

  this.setState({name:dbName})
  this.handleClose()
  emitter.emit(emitter.MESSAGE.SHOW_PROPERTIES,{database:dbName})
 },

 handleClick: function () {
  var dbName = Helper.trim(this.state.name,{name:dbName})
  if (dbName !== '') {
   this.addDbName(dbName)
  }
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_DB_NAME, function (obj) {
   if (obj && obj.name && obj.name !== '') {
    this.setState({name:obj.name})
    if (obj.preview)
     this.setState({preview:obj.preview})
   }

   this.showMe()
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_DB_NAME)
 },

 showMe: function () {
  this.setState({visible:true})
 },

 setName: function (value) {
  this.setState({name:value})
 },

 showSharing: function () {
  emitter.emit(emitter.MESSAGE.SHOW_SHARING)
 },

 render: function () {
  var output = null

  var action = null
  if (this.state.name !== '' || this.state.open) {
   action = <IconButton onClick={this.handleOpen}><FontIcon className="material-icons" color="white">mode_edit</FontIcon></IconButton>
  } else {
   action = <Deytah style={styles.deytahPos} handleClick={this.handleOpen} />
  }

  output =
   <AppBar
    iconElementLeft={<Avatar src={this.state.preview} />}
    style={this.state.visible ? {visibility:"visible",backgroundColor:cyan500} : {visibility:"hidden",backgroundColor:cyan500}}
    title={this.state.name !== '' ? this.state.name : "Gib Deiner Datenbank einen Namen"}
    iconElementRight={action}
   >
    <Dialog
      title="Datenbankname"
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
      <DbNameEdit setName={this.setName} name={this.state.name} />
     </Dialog>
   </AppBar>

  return (output)
 }

})



var DbNameEdit = React.createClass({

 onChange: function (e,value) {
  this.props.setName(value)
 },

 render: function () {
  return (
   <div className="animated zoomIn">
    <p> Hast du vielleicht eine Sammelleidenschaft? Kennst du alle deine Lieblingsbücher oder deine DVD-Sammlung auswendig? Kennst du dich perfekt mit allen Fussballclubs aus oder kennst jede Hunderasse? Dann lass uns eine Datenbank für dein Lieblingsthema erstellen. </p>

    <div style={styles.nameWrapper}>

     <TextField
      style={styles.nameInput}
      fullWidth={true}
      floatingLabelText="Dein Thema"
      hintText="Das wird der Name Deiner Datenbank"
      onChange={this.onChange}
      defaultValue={this.props.name}
      inputStyle={{color:"black"}}
      hintStyle={{color:"black"}}
      floatingLabelStyle={{color:"black"}}
     />

     <img src="client/images/db_name.png" style={styles.nameImg} />
    </div>
   </div>
  )
 }

})



export default DbName
