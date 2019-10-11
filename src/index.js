#!/usr/bin/env node
/** 
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
'use strict'
const fs = require('fs');
const {AragonPermissions} = require("./aragraph.js");

const argv = require('yargs') // eslint-disable-line
    .usage('Usage: $0 <command> [options]')
    .nargs([], 1)
    .demandCommand(1)
    .alias('c', 'config')
    .describe('c', 'path to configuration file')
    .help()
        .alias('h', 'help')
    .version()
        .alias('v', 'version')
    .argv

let config = null;

if(argv.config && argv.config.endsWith('.json')){
    config = JSON.parse(fs.readFileSync(argv.config));
}

argv._.forEach(inp => {
    if(inp.endsWith(".yaml")){
        console.log(new AragonPermissions().fromYaml(inp).uml());
    } else if(inp.endsWith(".md")){
        console.log(new AragonPermissions().fromMarkdownTable(inp).uml())
    }
})