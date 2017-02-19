var fs = require('fs-extra');			/* includes fs-extra, used for advanced file system manipulation */
var jsonfile = require('jsonfile');		/* includes jsonfile, used to load JSON files as objects */
var gui = require('nw.gui');			/* includes nw.gui, used to manipulate NW.js client */
var win = gui.Window.get();				/* includes window object, allows us to manipulate the window */
var sizeOf = require('image-size');		/* includes sizeOf, used to determine width + height of sprites */
