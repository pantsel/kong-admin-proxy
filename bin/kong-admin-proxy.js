#!/usr/bin/env node
var proxy = require('../lib/kong-admin-proxy');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

if (argv.help || (argv._[0] !== 'start' && argv._[0] !== 'build')) {
    console.log("Usage:");
    logHelp()
    process.exit()
}

if (argv._[0] === 'build') {
    proxy.build();
}

if (argv._[0] === 'start') {
    var port = argv._[1] ? argv._[1] : 1339;
    proxy.serve(port);
}


function logHelp() {
    console.log("=================================================================================");
    console.log("kaproxy start -p [port || 1339] : Start kong-admin-proxy service using the specified port");
    process.exit()
}
