import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import {List, ListItem} from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Divider from 'material-ui/Divider'

var ResultSet = React.createClass({

 render: function () {

  return (
   <Dialog
    title={"Suchresultate ("+this.props.resultSet.length+")"}
    modal={false}
    open={this.props.open}
    onRequestClose={this.props.close}
    autoScrollBodyContent={true}
   >
    {this.props.resultSet && this.props.resultSet.length > 0 &&
      <ResultList
       resultSet={this.props.resultSet}
       order={this.props.order}
       from={this.props.from}
       where={this.props.where}
       properties={this.props.properties}
      />
    }

    {this.props.resultSet && this.props.resultSet.length === 0 &&
     <p> Keine Treffer gefunden </p>
    }

   </Dialog>
  )
 }

})


var ResultList = React.createClass({

 getOperatorAsWord: function (operator) {
  if (operator === "equals") return "gleich"
  if (operator === "neq") return "ungleich"
  if (operator === "lt") return "kleiner als"
  if (operator === "gt") return "größer als"
  if (operator === "lte") return "kleiner gleich"
  if (operator === "gte") return "größer gleich"
 },

 getBoolAsWord: function (bool) {
  if (bool === "AND") return " UND "
  if (bool === "OR") return " ODER "
 },

 buildQueryAsSentence: function () {
  var select = ''
  for (var i = 0; i < this.props.order.length; i++) {
   select += this.props.order[i].value + (i+1== this.props.order.length? '' : ', ')
  }

  var where = this.props.properties[this.props.where[0].key] + ' ' + this.getOperatorAsWord(this.props.where[0].operator) + ' ' + this.props.where[0].value
  if (this.props.where[1] && this.props.where[2]) {
   where += this.getBoolAsWord(this.props.where[1].bool)
   where += this.props.properties[this.props.where[2].key] + ' ' + this.getOperatorAsWord(this.props.where[2].operator) + ' ' + this.props.where[2].value
  }

  return <div style={{padding:30}}> Zeige mir {select} von {this.props.from} wo {where} </div>
 },

 render: function () {
  return (
   <div>
    {this.buildQueryAsSentence()}
    <Divider />
    <List>
     {this.props.resultSet.map(function (result,index) {
      return <ResultItem result={result} order={this.props.order} key={index} />
      }.bind(this))
     }
    </List>
   </div>
  )
 }

})


var ResultItem = React.createClass({

 getInitialState: function () {
  return {hasImage:false,imageAtIndex:-1,avatar:null}
 },

 componentWillMount: function () {
  this.createAvatar()
 },

 createAvatar: function () {
  var index = -1
  for (var i = 0; i < this.props.order.length; i++) {
   if (this.props.order[i].key === "img")
    index = i
  }

  if (index !== -1) {
   this.setState({hasImage:true,imageAtIndex:index,avatar:<Avatar src={this.props.result[index]}/>})
  }

  return null
 },

 createSecondaryText: function () {
  var secondaryText = ''
  this.props.result.map(function (r,i) {
   if (i !== this.state.imageAtIndex)
    secondaryText += r + (i == this.props.result.length && !this.state.hasImage ? '' : ', ')
  }.bind(this))

  return secondaryText
 },

 render: function () {

  return (
   <ListItem
    secondaryText={this.createSecondaryText()}
    leftAvatar={this.state.avatar}
   />
  )
 }

})



export default ResultSet
