#!/usr/bin/env node
/** 
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
'use strict';

const fs = require('fs');
const {AragonPermissions} = require("./aragraph.js");

const argv = require('yargs') // eslint-disable-line
    .usage('Usage: $0 [options] <dao.yaml|Readme.md|0x1234...>')
    .nargs([], 1)
    .option('i', {
        alias: 'chain-id',
        default: 1,
        type: 'number',
    })
    .option('t', {
        alias: 'default-config',
        default: false,
        type: 'boolean',
    })
    .demandCommand(1)
    .alias('c', 'config')
    .describe('c', 'path to configuration file')
    .help()
        .alias('h', 'help')
    .version()
        .alias('v', 'version')
    .argv;

let config = null;

if(argv.config && argv.config.endsWith('.json')){
    config = JSON.parse(fs.readFileSync(argv.config));
} else if (argv.defaultConfig) {
    config = JSON.parse(fs.readFileSync(`${__dirname}/../templates/config.json`));
}

argv._.forEach(inp => {
    if(inp.endsWith(".yaml")){
        console.log(new AragonPermissions(config).fromYaml(inp).uml());
    } else if(inp.endsWith(".md")){
        console.log(new AragonPermissions(config).fromMarkdownTable(inp).uml());
    } else if(inp.startsWith('0x')){
        new AragonPermissions(config).fromDAO(inp, argv.chainId).then((aragaph) => {
            console.log(aragaph.uml());
            process.exit(0);
        });
    }
});