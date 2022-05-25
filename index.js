#!/usr/bin/env node
const { mkdirSync, createWriteStream, stat } = require('fs')
const ejs = require('ejs')
const { program } = require('commander');

const modes = [
    'js',
    'ts'
]
program
  .option('-c, --component <type>', '组件名称')
  .option('-m, --mode <type>', 'vue版本', 'js')

program.parse(process.argv);

const options = program.opts();
if (options.component) {
    const componentLocation = options.component
    const dirs = componentLocation.split('/')
    if (dirs.length>1) {
        dirs.splice(dirs.length-1, 1)
        createDir(dirs)
    }
    
    let ejsFile = options.mode?options.mode:'js'
    ejs.renderFile(`./template/${ejsFile}.ejs`, {name: dirs[dirs.length-1]}, (err, data) => {
        if(err) throw err


        const fdStream =createWriteStream(`${componentLocation}.vue`, (err) => {
            if (err) throw err
        })
        fdStream.write(data)
    })
}

async function createDir(dirs) {
    try {
        await stat(dirs.join('/'))
    } catch (e) {
        mkdirSync(dirs.join('/'), {recursive:true})
    }
}