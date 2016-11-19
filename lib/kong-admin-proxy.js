#!/usr/bin/env node
var child_process = require('child_process');
var spawn = child_process.spawn
var isWin = /^win/.test(process.platform);
var path = require('path')

exports.serve = function(port) {
    var cmd = spawn('sails' + ( isWin ? '.cmd' : '' ),
        [
            "lift",
            "--port=" + port
        ],
        {cwd : path.join(__dirname,".."), stdio: "inherit"});
    cmd.on('exit', function(code){
        console.log("Exiting",code);
    });
};