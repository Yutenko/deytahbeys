import React from 'react'

import Paper from 'material-ui/Paper'


var styles = {
 circle: {
  width:"100%",
  height:"100%",
  cursor:"pointer",
  backgroundColor:"#FDA907",
  backgroundImage:"url(client/images/deytahbeys.png)",
  backgroundSize:"90%",
  backgroundRepeat:"no-repeat",
  backgroundPosition:"center center"
 }
}

var Deytah = React.createClass({

 getInitialState: function () {
  return {active:true}
 },

 handleClick: function () {
  if (!this.props.keepMe)
   this.setState({active:false})

  this.props.handleClick()
 },

 render: function () {
  var output = null

  if (this.state.active)
   output = <div style={this.props.style} onClick={this.handleClick}>
             <Paper style={styles.circle} className="pulse pulse-deytah" zDepth={1} circle={true}  />
            </div>

  return (output)
 }

})



export default Deytah
