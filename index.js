#!/usr/bin/env node

'use strict';

const fetch    = require('node-fetch');
const cheerio  = require('cheerio');
const inquirer = require('inquirer');

const packages = [
  'es2015',
  'es2016',
  'es2017',
  'latest',
  'stage-0',
  'stage-1',
  'stage-2',
  'stage-3'
];

const npmURL   = 'https://www.npmjs.com/package/';
const commands = process.argv.slice(2);

if (commands.length === 0) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'packages',
      message: 'Select package',
      choices: packages
    }
  ]).then((p) => {
    const name = p.packages;

    return fetchPackage(name)
  }).then((res) => {
    if (res.status !== 200) {
      console.error('error');
      process.exit(1);
    }

    return res.text();
  }).then((body) => {
    return parseBody(body);
  }).then((plugins) => {
    return filterPlugins(plugins);
  }).then((plugins) => {
    console.log(JSON.stringify(plugins, 2, '  '));
  })
}

if (commands[0] === '-v' || commands[0] === '--version') {
  console.log(`Version: ${require('./package.json').version}`);
  process.exit();
}

function fetchPackage(packageName) {
  console.log(`${npmURL}babel-preset-${packageName}`)
  return fetch(`${npmURL}babel-preset-${packageName}`)
}

function parseBody(body) {
  const $ = cheerio.load(body);

  return $('.list-of-links').eq(1).children('a').toArray().map((e) => e.children[0].data);
}

function filterPlugins(plugins) {
  return {
    presets: plugins.filter((e) => e.search(/babel-preset/g)),
    plugins: plugins.filter((e) => e.search(/babel-plugin-transform/g))
  }
}
