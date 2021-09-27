import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Helper from './helper'
import emitter from '../emitter/emitter'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'


var styles = {
 shareBtn:{
  position:"fixed",
  bottom:10,
  left:10
 },
 codeWrapper:{
  position:"relative"
 },
 codeImg:{
  width:"50%",
  display:"block",
  margin:"0 auto"
 },
 code:{
  position:"absolute",
  width:"100%",
  textAlign:"center",
  bottom:"10%",
  fontSize:"1.5rem",
  color:"white"
 },
 dialogStyles:{
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width:"100%"
 }
}


var Sharing = React.createClass({

 getInitialState: function () {
  return {open:false,visible:false}
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_SHARING, function (obj) {
   this.setState({visible:true},function () {
    if (obj.popDialog)
     this.setState({open:true})
   }.bind(this))
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_SHARING)
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 render: function () {
  var output = null

  if (this.state.visible) {
   output = <div>
    <FloatingActionButton secondary={true} onTouchTap={this.handleOpen} iconStyle={{color:"white"}} style={styles.shareBtn}>
     <FontIcon className="material-icons">share</FontIcon>
    </FloatingActionButton>
 
    <Dialog
     title="Teilen und zusammen arbeiten"
     modal={false}
     open={this.state.open}
     onRequestClose={this.handleClose}
     autoScrollBodyContent={true}
     contentStyle={styles.dialogStyles}
    >
     <SharingContent code={Helper.getHashValue('db')}/>
    </Dialog>

   </div>
  }

  return (output)
 }
 
})


var SharingContent = React.createClass({

 render: function () {
  return (
   <div className="animated zoomIn">
    <p> Mit diesem Code kommst Du jederzeit zu Deiner Datenbank. Teile ihn mit anderen um gemeinsam an der Datenbank zu arbeiten.</p>

    <div style={styles.codeWrapper}>
     <div style={styles.code}>{this.props.code}</div>
     <img src="client/images/db_code.png" style={styles.codeImg} />
    </div>
   </div>
  )
 }

})


export default Sharing
