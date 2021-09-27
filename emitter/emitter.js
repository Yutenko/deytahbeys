import {EventEmitter} from 'fbemitter'
var emitter = new EventEmitter();

emitter.MESSAGE = {}
emitter.MESSAGE.SHOW_DB_NAME = 1
emitter.MESSAGE.SHOW_PROPERTIES = 2
emitter.MESSAGE.SHOW_DATATBASEITEMS_CONTAINER = 3
emitter.MESSAGE.SHOW_SQL = 4
emitter.MESSAGE.HIDE_SQL = 5
emitter.MESSAGE.SHOW_SNACKBAR = 6
emitter.MESSAGE.HIDE_SNACKBAR = 7
emitter.MESSAGE.SHOW_SHARING = 8


export default emitter



