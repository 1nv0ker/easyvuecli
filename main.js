#!/usr/bin/env node
const { createWriteStream } = require('fs')
const ejs = require('ejs')
const { program } = require('commander');
const path = require('path')

const { createDir } = require('./utils')
const { createSwaggerType } = require('./swagger')
const modes = [
    'js',
    'ts'
]
program
  .option('-c, --component <type>', 'component name')
  .option('-n, --name <type>', 'vue component name')
  .option('-m, --mode <type>', 'js mode or ts mode', modes[0])
  .option('-s, --store <type>', 'js mode or ts mode')
  .option('-sn, --storename <type>', 'vue store name')
  .option('-sw, --swagger <type>', 'swagger request url')
  .option('-swn, --swaggername <type>', 'swagger type file name')

program.parse();

const options = program.opts();
if (options.component) {//vue文件
    const componentLocation = options.component
    const dirs = componentLocation.split('/')
    if (dirs.length>1) {
        dirs.splice(dirs.length-1, 1)
        createDir(dirs)//创建文件夹
    }
    
    let ejsFile = options.mode?(modes.indexOf(options.mode) === -1?modes[0]:options.mode):modes[0]
    ejs.renderFile(path.resolve(__dirname+`/template/component/${ejsFile}.ejs`), {name: options.name?options.name:dirs[dirs.length-1]}, (err, data) => {
        if(err) throw err


        const fdStream =createWriteStream(`${componentLocation}.vue`, (err) => {
            if (err) throw err
        })
        fdStream.write(data)
    })
}
if (options.store) {//store文件
    const storeLocation = options.store
    const dirs = storeLocation.split('/')
    if (dirs.length>1) {
        dirs.splice(dirs.length-1, 1)
        createDir(dirs)//创建文件夹
    }
    
    let ejsFile = options.mode?(modes.indexOf(options.mode) === -1?modes[0]:options.mode):modes[0]
    ejs.renderFile(`./template/store/${ejsFile}.ejs`, {name: options.sn}, (err, data) => {
        if(err) throw err


        const fdStream =createWriteStream(`${storeLocation}.${ejsFile}`, (err) => {
            if (err) throw err
        })
        fdStream.write(data)
    })
}
if (options.swagger) {//swagger 类型文件
    const name = options.swaggername?options.swaggername:'test'
    createSwaggerType(options.swagger, name)
}