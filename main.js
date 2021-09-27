require('./client/animate.css')
require('./client/style.css')

import injectTapEventPlugin from 'react-tap-event-plugin';
 
// Needed for onTouchTap 
// http://stackoverflow.com/a/34015469/988941 
injectTapEventPlugin();

import React from 'react'
import ReactDOM from 'react-dom'

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import Messenger from './components/snackbar'

import Start from './components/start'
import DbName from './components/dbname'
import Properties from './components/properties'
import Helper from './components/helper'
import DatabaseItems from './components/databaseItems'
import SQL from './components/sql'
import Sharing from './components/sharing'


var App = React.createClass({

 render: function () {

  return (
   <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <div>
     <Start />
     <DbName />
     <Properties />
     <DatabaseItems />
     <SQL />
     <Sharing />
     <Messenger />
    </div>
   </MuiThemeProvider>
  )
 }

})


ReactDOM.render(<App/>,document.getElementById('app'))
