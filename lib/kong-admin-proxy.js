#!/usr/bin/env node
var child_process = require('child_process');
var spawn = child_process.spawn
var path = require('path')

exports.serve = function() {
    var cmd = spawn('node',
        [
            "app.js"
        ],
        {cwd : path.join(__dirname,".."), stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log("Exiting",code);
    });
};