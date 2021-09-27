import React from 'react'



var Helper = React.createClass({
 
 statics: {
  getHashValue: function (key) {
   var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
   return matches ? matches[1] : null;
  },

  trim: function (str) {
   return str.replace(/^\s+|\s+$/gm,'')
  },

  mapObject: function (object, callback) {
   return Object.keys(object).map(function (key) {
    return callback(key, object[key])
   })
  }

 },


 render: function () {
  return null
 }


})


export default Helper

