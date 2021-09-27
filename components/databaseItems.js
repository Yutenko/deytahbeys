import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'
import Deytah from './deytah'
import DatabaseItem from './databaseitem'
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system'
import emitter from '../emitter/emitter'
import Helper from './helper'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'


var styles = {
 paper:{
  position:"relative",
  width:"100%",
  height:300,
  marginBottom:30,
  border:0,
  boxShadow:"none"
 },
 addBtn:{
  marginTop:"20%",
  marginLeft:"44%"
 },
 untilText:{
  padding:30,
  textAlign:"center"
 },
 deytahPos:{
  width:50,
  height:50,
  margin:"0 auto",
  paddingTop:"20%"
 },
 container:{
  position:"relative"
 },
 note:{
  textAlign:"center",
  padding:20,
  marginBottom:"5%"
 },
 itemsUntilUnlockSQL:{
  color:"rgba(255, 255, 255, 0.6)",
  paddingTop:20
 }
}


var DatabaseItems = React.createClass({

 getInitialState: function () {
  return {visible:false,items:{},properties:{},database:''}
 },

 statics: {
  canUnlockSQL: function (items) {
   // we need minimum 4 items for sql and gaming
   var unlockSQLAt = 4
   var finishedDatabaseItems = 0
   var self = this

   Helper.mapObject(items,function (key,value) {
    if (finishedDatabaseItems >= unlockSQLAt)
     return
    else {
     if (value) {
      if ( (value.a !== '' || value.a === true || value.a === false || value.a === null || value.a === 'undefined' || !value.a) &&
           (value.b !== '' || value.b === true || value.b === false || value.b === null || value.b === 'undefined' || !value.b) &&
           (value.c !== '' || value.c === true || value.c === false || value.c === null || value.c === 'undefined' || !value.c) &&
           (value.d !== '' || value.d === true || value.d === false || value.d === null || value.d === 'undefined' || !value.d) &&
            value.img !== ''
         )
       finishedDatabaseItems++
     }
    }
   })

   return {unlocked:finishedDatabaseItems >= unlockSQLAt,finishedItems:finishedDatabaseItems,unlockAt:unlockSQLAt}
  }
 },

 componentDidMount: function () {
  ReactDOM.findDOMNode(this).scrollTop = 0
 },

 addDatabaseItem: function () {
  var emptyItem = {img:'',a:'',b:'',c:'',d:''}
  var dbId = Helper.getHashValue('db')

  var id = firebase.database().ref('dbs/'+dbId+'/items').push(emptyItem,function () {
   var newData = update(this.state,{items:{[id]:{$set: emptyItem}}})
   this.setState(newData)
  }.bind(this)).key
 },

 updateDatabaseItemImg: function (itemId,imgPath) {
  var newData = update(this.state,{items:{[itemId]:{['img']:{$set:imgPath}}}})
  this.setState(newData,this.informComponents)
 },

 updateDatabaseItemProperty: function (itemId,key,value) {
  var newData = update(this.state,{items:{[itemId]:{[key]:{$set:value}}}})
  this.setState(newData,function () {
   this.informComponents()
  }.bind(this))
 },

 deleteDatabaseItem: function (itemId) {
  var mutateMe = JSON.parse(JSON.stringify(this.state.items))
  delete mutateMe[itemId]

  // check if items are empty, set default value
  if (Object.keys(mutateMe).length == 0)
   mutateMe = {}

  this.setState({items:mutateMe},this.checkIfEmptyItems)
 },

 informComponents: function () {
  if (DatabaseItems.canUnlockSQL(this.state.items).unlocked) {
   emitter.emit(emitter.MESSAGE.SHOW_SQL,{items:this.state.items,properties:this.state.properties,database:this.state.database})
  } else {
   emitter.emit(emitter.MESSAGE.HIDE_SQL)
  }
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_DATATBASEITEMS_CONTAINER,function (obj) {
   if (obj.items && obj.properties && obj.database)
    this.setState({items:obj.items,properties:obj.properties})
   else if (obj.items && !obj.properties)
    this.setState({items:obj.items})
   else if (!obj.items && obj.properties)
    this.setState({properties:obj.properties})

   if (obj.database)
    this.setState({database:obj.database})

   this.showMe()
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_DATATBASEITEMS_CONTAINER)
 },

 checkIfEmptyItems: function () {
  // if there are zero items, add one
  if (Object.keys(this.state.items).length == 0 && this.state.visible) {
   this.addDatabaseItem()
  }
 },

 componentDidMount: function () {
  this.checkIfEmptyItems()
 },

 showMe: function () {
  this.setState({visible:true})
 },

 render: function () {
  var floatingBtn = <FloatingActionButton secondary={true} style={styles.addBtn} onTouchTap={this.addDatabaseItem} iconStyle={{color:"white"}}>
     <FontIcon className="material-icons">add</FontIcon>
    </FloatingActionButton>

  var deytah = <Deytah style={styles.deytahPos} handleClick={this.addDatabaseItem} keepMe={true}/>

  var sql = DatabaseItems.canUnlockSQL(this.state.items)
  var itemsUntilUnlockSQL = !isNaN(sql) ? sql.unlockAt : sql.unlockAt - sql.finishedItems

  var addCard = <Paper style={styles.paper}>
   <div>
   {(Object.keys(this.state.items).length >= 0 && Object.keys(this.state.items).length < 2) && deytah}
   {Object.keys(this.state.items).length >= 2 && floatingBtn}
   {Object.keys(this.state.items).length < 4 &&
    <div style={styles.untilText}>noch <span style={{color:"white"}}>{4 - Object.keys(this.state.items).length}</span> Karten ausfüllen </div>
   }
   </div>
  </Paper>


  return (
   <div style={this.state.visible ? {visibility:"visible",marginTop:50} : {visibility:"hidden",marginTop:50}}>
    <div style={styles.container}>

     {Helper.mapObject(this.state.items,function (key,value) {
      return <Col lg={4} md={6} sm={6} xs={12} key={key}>
              <DatabaseItem
               item={value}
               id={key}
               properties={this.state.properties}
               updateDatabaseItemImg={this.updateDatabaseItemImg}
               updateDatabaseItemProperty={this.updateDatabaseItemProperty}
               deleteDatabaseItem={this.deleteDatabaseItem}
              />
             </Col>
      }.bind(this))
     }

     <Col lg={4} md={6} sm={6} xs={12}>{addCard}</Col>

    </div>
   </div>
  )
 }



})


export default DatabaseItems
