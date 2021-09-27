import React from 'react'

import Paper from 'material-ui/Paper'
import Deytah from './deytah'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import CircularProgress from 'material-ui/CircularProgress'

import emitter from '../emitter/emitter'
import ReactFireMixin from 'reactfire'
import shortid from 'shortid'
import Helper from './helper'
import DatabaseItems from './databaseItems'
import ReactFitText from 'react-fittext'
import {grey600} from 'material-ui/styles/colors'
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'


var styles = {
 deytahPos:{
  margin:"0 auto",
  padding:35,
  width:100,
  height:100
 },
 loadingCircle:{
  position:"absolute",
  left:"47%",
  top:"20%"
 },
 welcomeMsg:{
  color:grey600,
  paddingLeft:50,
  paddingRight:50,
  fontFamily:"Roboto, sans-serif !important"
 }
}

var Start = React.createClass({

 getInitialState: function () {
  return {open:false,code:null,showCodeInput:true,showLoadingCircle:false,startFresh:false}
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 startFresh: function () {
  this.setState({startFresh:true,open:true})
  var shortId = shortid.generate()
  window.location.hash = "db="+shortId
  emitter.emit(emitter.MESSAGE.SHOW_DB_NAME)
 },

 componentWillMount: function () {
  var db = Helper.getHashValue('db')
  if (db && db !== '') {
   this.setState({code:db},function () {
    this.handleClick()
   }.bind(this))
  }
 },

 informAppComponents: function (db) {
  if (db.name) {
   emitter.emit(emitter.MESSAGE.SHOW_SHARING,{popDialog:false})
   if (db.items)
    emitter.emit(emitter.MESSAGE.SHOW_DB_NAME,{name:db.name,preview:db.items[Object.keys(db.items)[0]].img})
   else
    emitter.emit(emitter.MESSAGE.SHOW_DB_NAME,{name:db.name})
  }
  if (db.properties) emitter.emit(emitter.MESSAGE.SHOW_PROPERTIES,{properties:db.properties,name:db.name})
  if (db.items) {
   if (db.name) {
    emitter.emit(emitter.MESSAGE.SHOW_DATATBASEITEMS_CONTAINER,{items:db.items,properties:db.properties,database:db.name})

    if (DatabaseItems.canUnlockSQL(db.items).unlocked && db.properties)
     emitter.emit(emitter.MESSAGE.SHOW_SQL,{items:db.items,properties:db.properties,database:db.name,simpleQueryFinished:db.simpleQueryFinished})
   }
  }

 },

 handleClick: function () {
  this.setState({showCodeInput:false})

  if (this.state.code) {
   var code = Helper.trim(this.state.code)
   if (code !== '') {
    this.setState({showLoadingCircle:true})
    var dbRef = firebase.database().ref('dbs/' + this.state.code);
    dbRef.on('value', function(snapshot) {

     var db = snapshot.val()
     if (db) {
      // valid db code, start app
      window.location.hash = "db="+code
      this.informAppComponents(db)
     } else {
      // invalid code, start fresh
      this.startFresh()
     }
     this.setState({showLoadingCircle:false})
    }.bind(this))
   } else {
    // no code entered or empty input, start fresh
    this.startFresh()
   }
  } else this.startFresh()

 },

 onCodeEntered: function (e,value) {
  this.setState({code:value})
 },

 handleEnter: function (e) {
  if (e.keyCode === 13) {
   this.handleClick()
  }
 },

 render: function () {
  var output = null

  if (this.state.showCodeInput) {
   output = <Container>
    <Row>
     <Col lg={4} md={4} sm={6} xs={12} style={{float:"none",margin:"0 auto",marginTop:-50}}>
      <Card>
       <CardText>

        <div style={{textAlign:"center"}}>
        <Deytah style={styles.deytahPos} handleClick={this.handleClick}/>

        <ReactFitText maxFontSize={40} compressor={1.5}>
         <h1 style={styles.welcomeMsg} className="animated bounceInUp">
          Hey, ich bin <span style={{color:"white"}}>Deytah Beys</span>. Ich begleite Dich ab hier. Drück auf mich drauf und es geht los.
         </h1>
        </ReactFitText>

        <p style={styles.welcomeMsg}> Wenn Du schon einen Code besitzt, gib ihn hier ein und dann klick mich </p>

        <TextField
         floatingLabelText="Code"
         onChange={this.onCodeEntered}
         onKeyDown={this.handleEnter}
         className="animated bounceInDown"
        />

       </div>

      </CardText>
     </Card>

    </Col>
   </Row>
   </Container>
  }

  else if (this.state.showLoadingCircle) {
   output = <Container>
     <Row>
      <Col lg={4} md={4} sm={6} xs={12} style={{float:"none",margin:"0 auto",marginTop:"20%"}}>
       <CircularProgress size={80} style={styles.loadingCircle} />
      </Col>
     </Row>
    </Container>
  }

  return (output)
 }

})














export default Start
