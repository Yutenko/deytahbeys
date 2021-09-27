import React from 'react';
import Snackbar from 'material-ui/Snackbar';

import emitter from '../emitter/emitter'

var Messenger = React.createClass({

 getInitialState: function () {
  return {open: false,message:'',autohideDuration:4000}
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_SNACKBAR,function (data) {
   this.showMe(data)
  }.bind(this))
  this.token2 = emitter.addListener(emitter.MESSAGE.HIDE_SNACKBAR,function (data) {
   this.handleRequestClose(data)
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_SNACKBAR)
  this.token.remove(emitter.MESSAGE.HIDE_SNACKBAR)
 },

 showMe: function (data) {
  this.setState({open:true,message:data.msg,autohideDuration:(data.autohideDuration ? data.autohideDuration : this.state.autohideDuration)})
 },

 handleRequestClose: function () {
  this.setState({open: false})
 },

 render() {
  return (
   <Snackbar
    open={this.state.open}
    message={this.state.message}
    autoHideDuration={this.state.autohideDuration}
    onRequestClose={this.handleRequestClose}
   />
  )
 }

})

export default Messenger
