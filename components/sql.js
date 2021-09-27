import React from 'react'
import update from 'react-addons-update'


import FloatingActionButton from 'material-ui/FloatingActionButton'
import emitter from '../emitter/emitter'
import FontIcon from 'material-ui/FontIcon'
import Dialog from 'material-ui/Dialog'
import Deytah from './deytah'
import Chip from 'material-ui/Chip'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton/IconButton'
import DropDownMenu from 'material-ui/DropDownMenu'
import Helper from './helper'
import _ from 'lodash'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import ResultSet from './resultSet'

var styles = {
 sqlBtn:{
  position:"fixed",
  bottom:20,
  right:20,
  width:50,
  height:50
 },
 table:{
  width:"100%"
 },
 lastTd:{
  float:"right"
 },
 chip:{
  margin:4
 },
 chipWrapper:{
  display:'flex',
  flexWrap:'wrap',
  marginBottom:4
 },
 td:{
  height:70
 },
 firstTd:{
  width:100
 },
 queryBtn:{
  float:"right",
  marginTop:10
 },
 dbHeadSearch:{
  position:"absolute",
  width:200,
  top:-100,
  right:50,
  zIndex:-1
 },
}

var SQL = React.createClass({

 getInitialState: function () {
  return {open:false,visible:false,finishedQueries:false,items:{},properties:{},database:'',simpleQueryFinished:false}
 },

 handleOpen: function () {
  this.setState({open: true})
 },

 handleClose: function () {
  this.setState({open: false})
 },

 showMe: function () {
  this.setState({visible:true})
 },

 hideMe: function () {
  this.setState({visible:false})
 },

 componentWillMount: function () {
  this.token = emitter.addListener(emitter.MESSAGE.SHOW_SQL, function (data) {
   if (data.items && data.properties && data.database)
    this.setState({items:data.items,properties:data.properties,database:data.database,simpleQueryFinished:(data.simpleQueryFinished ? true : false)})

   this.showMe()
  }.bind(this))

  this.token2 = emitter.addListener(emitter.MESSAGE.HIDE_SQL, function () {
   this.hideMe()
  }.bind(this))
 },

 componentWillUnmount: function () {
  this.token.remove(emitter.MESSAGE.SHOW_SQL)
  this.token2.remove(emitter.MESSAGE.HIDE_SQL)
 },

 setSimpleQueryFinished: function () {
  var shortid = Helper.getHashValue('db')
  firebase.database().ref('dbs/'+shortid+'/simpleQueryFinished').set(true,function () {
   this.setState({simpleQueryFinished:true})
  }.bind(this))
 },

 resetSimpleQueryFinished: function () {
   var shortid = Helper.getHashValue('db')
   firebase.database().ref('dbs/'+shortid+'/simpleQueryFinished').set(false,function () {
    this.setState({simpleQueryFinished:false})
   }.bind(this))
 },

 setSQLFinished: function () {
  this.setState({finishedQueries:true})
  this.handleOpen()
  // firebase
  // state finishedQueries
  // emit game
 },

 filterPropsFromTypes: function () {
  return {
   a:this.state.properties.a,
   b:this.state.properties.b,
   c:this.state.properties.c,
   d:this.state.properties.d
  }
 },

 render: function () {
  var action = null
  if (this.state.finishedQueries) {
   action = <FloatingActionButton secondary={true} onTouchTap={this.handleOpen} iconStyle={{color:"white"}} style={styles.sqlBtn}>
      <FontIcon className="material-icons">search</FontIcon>
     </FloatingActionButton>
  } else {
   action = <Deytah handleClick={this.setSQLFinished} style={styles.sqlBtn} />
  }


  return (
   <div style={this.state.visible ? {visibility:"visible"} : {visibility:"hidden"}}>
    {action}

    <Dialog
      title={<div>SQL - Automatisierte Auswertung <div style={{fontSize:14}}>Structured Query Language</div></div>}
      modal={false}
      open={this.state.open}
      onRequestClose={this.handleClose}
      autoScrollBodyContent={true}
     >
      <SQLMode
       properties={this.filterPropsFromTypes(this.state.properties)}
       propertiesWithTypes={this.state.properties}
       items={this.state.items}
       database={this.state.database}
       setSimpleQueryFinished={this.setSimpleQueryFinished}
       simpleQueryFinished={this.state.simpleQueryFinished}
       resetSimpleQueryFinished={this.resetSimpleQueryFinished}
      />
     </Dialog>

   </div>
  )
 }

})



var SQLMode = React.createClass({

 getInitialState: function () {
  return {
   select:[],
   from:this.props.database,
   where:[],
   showResultSet:false,
   resultSet:[]
  }
 },

 boolConcat: function (a,operatorAsString,b) {
  if (operatorAsString === "AND") return a && b
  if (operatorAsString === "OR") return a || b
 },

 operatorConcat: function (propertyToCheck,operatorAsString,destinationValue,type) {
  if (type === 'number') {
   propertyToCheck = parseFloat(propertyToCheck)
   destinationValue = parseFloat(destinationValue)
  }

  if (type === 'boolean') {
   if (propertyToCheck === true) {
    propertyToCheck = true
   }
   else if (propertyToCheck === false) {
    propertyToCheck = false
   }
   else if (propertyToCheck.toLowerCase() === 'ja' || propertyToCheck.toLowerCase() === 'wahr' || propertyToCheck.toLowerCase() === 'richtig')
    propertyToCheck = true
   else if (propertyToCheck === '' || propertyToCheck.toLowerCase() === 'nein' || propertyToCheck.toLowerCase() === 'falsch' || propertyToCheck.toLowerCase() === 'unwahr')
    propertyToCheck = false

   if (destinationValue.toLowerCase() === 'ja' || destinationValue.toLowerCase() === 'wahr' || destinationValue.toLowerCase() === 'richtig')
    destinationValue = true
   else if (destinationValue.toLowerCase() === 'nein' || destinationValue.toLowerCase() === 'falsch' || destinationValue.toLowerCase() === 'unwahr')
    destinationValue = false
  }


  if (operatorAsString === "equals") return propertyToCheck === destinationValue
  if (operatorAsString === "lt")     return propertyToCheck < destinationValue
  if (operatorAsString === "gt")     return propertyToCheck > destinationValue
  if (operatorAsString === "neq")    return propertyToCheck != destinationValue
  if (operatorAsString === "lte")    return propertyToCheck <= destinationValue
  if (operatorAsString === "gte")    return propertyToCheck >= destinationValue
 },

 execQuery: function () {
  if (this.state.select.length > 0 &&
      this.state.from !== '' &&
      this.state.where[0]) {

   // unlock bool queries by setting first query as done
   if (!this.props.simpleQueryFinished) {
    this.props.setSimpleQueryFinished()
   }

   var resultSet = []

   // check if it is a boolean operation
   var isBoolQuery = false
   if (this.state.where[1] && this.state.where[2]) {
    if (this.state.where[1].key != '' && this.state.where[1].operator != '' && this.state.where[1].value != '') {
     if (this.state.where[2].bool != '') {
      isBoolQuery = true
     }
    }
   }

   // iterate all databaseitems
   Helper.mapObject(this.props.items, function (key,item) {

    // first where clause on current item
    var a = this.operatorConcat(
     item[this.state.where[0].key],
     this.state.where[0].operator,
     this.state.where[0].value,
     this.props.propertiesWithTypes[this.state.where[0].key+'Type']
    )

    // if it is a boolean operator, concat both
    if (isBoolQuery) {
     var b = this.operatorConcat(
      item[this.state.where[2].key],
      this.state.where[2].operator,
      this.state.where[2].value,
      this.props.propertiesWithTypes[this.state.where[2].key+'Type']
     )


     // boolean concat
     if (this.boolConcat(a,this.state.where[1].bool,b)) {
      var item = this.state.select.map(function (select,index) {
       return item[select.key]
      }.bind(this))

      resultSet.push(item)
     }
    } else {
     // no boolean query, just return
     if (a && !isBoolQuery) {
      var item = this.state.select.map(function (select,index) {
       return item[select.key]
      }.bind(this))

      resultSet.push(item)
     }
    }

   this.showResultSet(resultSet)

   }.bind(this))
  }
 },

 showResultSet: function (resultSet) {
  this.setState({resultSet:resultSet,showResultSet:true})
 },

 closeResultSet: function () {
  this.setState({showResultSet:false})
 },

 setSelect: function (select) {
  this.setState({select:select})
 },

 addToWhere: function (obj,clause) {
  // clause points to the index in the where clause from state, where you have to set the item
  var mutateMe = JSON.parse(JSON.stringify(this.state.where))
  mutateMe[clause] = obj
  this.setState({where:mutateMe})
 },

 getProperties: function () {
  return <span style={{color:"white"}}>
          {this.props.properties.a}, {this.props.properties.b}, {this.props.properties.c} und {this.props.properties.d}
         </span>
 },

 exampleQuery: function () {
  return <span style={{color:"white"}}>
   Zeige mir {this.props.properties.b} von {this.props.database} wo {this.props.properties.a} gleich {this.props.items[Object.keys(this.props.items)[0]].a}
         </span>
 },

 resetSecondWhereClause: function () {

 },

 render: function () {
  return (
   <div>
    <img src="client/images/db_head_search.png" style={styles.dbHeadSearch} />
    <p> Alle Deine Datenbankeinträge sind strukturiert nach {this.getProperties()}. Der Vorteil dieser Struktur ist, dass wir nun Fragen stellen können und die Datenbank für uns suchen geht und uns die Antwort liefert. Zum Beispiel: {this.exampleQuery()} </p>
    <Divider />
    <Select title="Zeige mir" properties={this.props.properties} setSelect={this.setSelect}/>
    <From database={this.props.database} />
    <Where properties={this.props.properties} items={this.props.items} addToWhere={this.addToWhere} clause={0} />

   {this.props.simpleQueryFinished &&
    <div>
     <Divider />
     <p>
      Du kannst natürlich auch beliebige Eigenschaften kombinieren über <span style={{color:"white"}}>logische Operatoren</span>. Probiere es aus
     </p>

     <table style={styles.table}>
      <tbody>
       <tr>
        <td style={styles.firstTd}> <BoolOperator addToWhere={this.addToWhere} clause={1}/> </td>
        <td> <Where properties={this.props.properties} items={this.props.items} addToWhere={this.addToWhere} clause={2} /> </td>
        <td style={styles.lastTd}>
         <IconButton onTouchTap={this.props.resetSimpleQueryFinished}><FontIcon className="material-icons">delete_forever</FontIcon></IconButton>
        </td>
       </tr>
      </tbody>
     </table>

    </div>
   }

   <Divider />

   <FlatButton
    label="Suchanfrage ausführen"
    icon={<FontIcon className="material-icons">search</FontIcon>}
    style={styles.queryBtn}
    onTouchTap={this.execQuery}
   />

   <ResultSet
    resultSet={this.state.resultSet}
    open={this.state.showResultSet}
    order={this.state.select}
    close={this.closeResultSet}
    from={this.state.from}
    where={this.state.where}
    properties={this.props.properties}
   />

   </div>
  )
 }

})

var BoolOperator = React.createClass({

 getInitialState: function () {
  return {value:''}
 },

 onChange: function (e,index,value) {
  this.setState({value:value})
  this.props.addToWhere({
   bool:value
  },this.props.clause)
 },

 render: function () {
  return (
   <DropDownMenu value={this.state.value} onChange={this.onChange} style={this.props.style}>
    <MenuItem value={'AND'} primaryText="UND" />
    <MenuItem value={'OR'} primaryText="ODER" />
   </DropDownMenu>
  )
 }

})

var Where = React.createClass({

 getInitialState: function () {
  return {
   currentPropertyKey:'',
   currentOperator:'',
   currentValue:'',
   filteredProperties:{},
   operatorsDropDownVisible:false,
   valuesDropDownVisible:false
  }
 },

 setCurrentPropertyKey: function (selectedPropertyKey) {
  this.setState({currentPropertyKey:selectedPropertyKey,operatorsDropDownVisible:true},function () {
   this.filterProperties()
   this.isWhereClauseComplete()
  }.bind(this))
 },

 setCurrentOperator: function (operator) {
  this.setState({currentOperator:operator},this.isWhereClauseComplete)
 },

 setCurrentValue: function (value) {
  this.setState({currentValue:value},this.isWhereClauseComplete)
 },

 isWhereClauseComplete: function () {
  if (this.state.currentPropertyKey !== '' && this.state.currentOperator !== '' && this.state.currentValue !== '') {
   this.props.addToWhere({
    key:this.state.currentPropertyKey,
    operator:this.state.currentOperator,
    value:this.state.currentValue
   },this.props.clause)
  }
 },

 showValues: function () {
  this.setState({valuesDropDownVisible:true})
 },

 filterProperties: function () {
   console.log(this.props.items);
  var filteredProperties = Helper.mapObject(this.props.items,function (key,value) {
    var v = value[this.state.currentPropertyKey]
    if (v === "") v = false
    return v
  }.bind(this))
  filteredProperties = _.uniq(filteredProperties)
  if (typeof filteredProperties[0] === "boolean") {
    for (var i = 0; i < filteredProperties.length; i++) {
      if (filteredProperties[i] === false) filteredProperties[i] = 'falsch'
      if (filteredProperties[i] === true) filteredProperties[i] = 'wahr'
    }
  }
  this.setState({filteredProperties:filteredProperties})
 },

 render: function () {
  return (
   <table style={styles.table}>
    <tbody>
     <tr>
      <td style={styles.firstTd}>wo</td>
      <td style={styles.td}>

       <QueryDropDownMenu
        data={this.props.properties}
        setKey={this.setCurrentPropertyKey}
       />

       <QueryDropDownMenu
        data={{equals:"=",lt:"<",gt:">",neq:"≠",lte:'<=',gte:'>='}}
        showMe={this.showValues}
        setKey={this.setCurrentOperator}
        style={this.state.operatorsDropDownVisible ? {visibility:"visible"} : {visibility:"hidden"}}
       />

       <QueryDropDownMenu
        data={this.state.filteredProperties}
        setValue={this.setCurrentValue}
        style={this.state.operatorsDropDownVisible ? {visibility:"visible"} : {visibility:"hidden"}}
       />

      </td>
     </tr>
    </tbody>
   </table>
  )
 }

})

var From = React.createClass({

 render: function () {
  return (
   <table style={styles.table}>
    <tbody>
     <tr>
      <td style={styles.firstTd}>von</td>
      <td style={{color:"white"}}>{this.props.database}</td>
     </tr>
    </tbody>
   </table>
  )
 }

})


var Select = React.createClass({

 getInitialState: function () {
  return {selectedItems:[]}
 },

 selectItem: function (key) {

  var newData = null
  if (key == "*") {
   var obj = Helper.mapObject(this.props.properties,function (key,value) {
    return {key:key,value:value}
   })
   obj.push({key:"img",value:"Bild"})
   newData = update(this.state,{selectedItems:{$set:obj}})
   this.setState(newData,function () {
    this.props.setSelect(this.state.selectedItems)
   })
  }
  else {
   var toPush = {key:key,value:this.props.properties[key]}

   if (key === "img")
    toPush = {key:"img",value:"Bild"}

   var mutateMe = JSON.parse(JSON.stringify(this.state.selectedItems))

   var index = -1
   for (var i = 0; i < mutateMe.length; i++) {
    if (_.isEqual(mutateMe[i],toPush)) {
     index = i
     break
    }
   }

   if (index === -1) {
    newData = update(this.state,{selectedItems:{$push:[ toPush ]}})
    this.setState(newData,function () {
     this.props.setSelect(this.state.selectedItems)
    })
   }
  }


 },

 componentDidMount: function () {
  this.selectItem('*')
 },

 deleteItem: function (selectedItem) {
  var index = this.state.selectedItems.map(function(item) {return item}).indexOf(selectedItem)

  var newData = update(this.state,{
   selectedItems:{
    $splice: [[index,1]]
   }
  })

  this.setState(newData,function () {
   this.props.setSelect(this.state.selectedItems)
  })
 },

 render: function () {
  return (
   <table style={styles.table}>
    <tbody>
     <tr>
      <td style={styles.firstTd}>{this.props.title}</td>
      <td>
       <div style={styles.chipWrapper}>
        {this.state.selectedItems.map(function (item, index) {
          return <SelectChip deleteItem={this.deleteItem} item={item} key={index} />
         }.bind(this))
        }
       </div>
      </td>
      <td style={styles.lastTd}><QueryIconMenu data={this.props.properties} selectItem={this.selectItem} /></td>
     </tr>
    </tbody>
   </table>
  )
 }

})

var SelectChip = React.createClass({

 deleteItem: function () {
  this.props.deleteItem(this.props.item)
 },

 render: function () {
  return (
   <Chip
    onRequestDelete={this.deleteItem}
    style={styles.chip}
   >
    {this.props.item.value}
   </Chip>

  )
 }

})


var QueryDropDownMenu = React.createClass({

 getInitialState: function () {
  return {value:''}
 },

 onChange: function (e,index,key) {
  this.setState({value:key})

  if (this.props.setKey) {
   this.props.setKey(key)
  }

  if (this.props.setValue) {
   this.props.setValue(this.props.data[key])
  }

  if (this.props.showMe) {
   this.props.showMe()
  }
 },

 render: function () {
  return (
   <DropDownMenu value={this.state.value} onChange={this.onChange} style={this.props.style}>
    {Helper.mapObject(this.props.data,function (key,value) {
       return <MenuItem value={key} primaryText={value} key={key} />
     })
    }
   </DropDownMenu>
  )
 }

})


var QueryIconMenu = React.createClass({

 handleSelectedItem: function (e,selectedItem) {
  this.props.selectItem(selectedItem.key)
 },

 render: function () {

  return (
   <IconMenu
    onItemTouchTap={this.handleSelectedItem}
    iconButtonElement={<IconButton><FontIcon className="material-icons">more_vert</FontIcon></IconButton>}
    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
    targetOrigin={{horizontal: 'left', vertical: 'top'}}
   >
    <MenuItem primaryText="Alle Eigenschaften" key={"*"} />
    <MenuItem primaryText="Bild" key={"img"} />
    {Helper.mapObject(this.props.data,function (key, value) {
      return <MenuItem primaryText={value} key={key}/>
     })
    }
    </IconMenu>
  )
 }

})






export default SQL
