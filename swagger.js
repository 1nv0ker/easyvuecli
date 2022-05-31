const ejs = require('ejs')
const { createWriteStream, stat } = require('fs')
const axios = require('axios')
const { createDir } = require('./utils')
const path = require('path')
async function main(filepath, resultPath) {
    let swaggerData = {}
    var reg=/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
    if (reg.test(filepath)) {
        await axios.get(filepath)
        .then(res => {
            swaggerData = res.data
        })
    } else {
        swaggerData = require(filepath)
    }
    handleSwagger(swaggerData, resultPath)
    
}

function handleSwagger(swaggerData, resultPath) {
    if (!swaggerData.components) throw 'swagger data is no valid'

    let tempComponents = {}
    for (let key in swaggerData.components.schemas) {
        if (swaggerData.components.schemas[key]['properties']) {
            tempComponents[key] = swaggerData.components.schemas[key]['properties']
        }
    }

    let componentTypes = {}
    for (let key in tempComponents) {
        let types = []
        for (let key2 in tempComponents[key]) {
            if (tempComponents[key][key2]['type']) {
                types.push({
                    type: handleType(tempComponents[key][key2]),
                    name: key2
                })
            }
            if (tempComponents[key][key2]['$ref']) {
                let temp = tempComponents[key][key2]['$ref'].split('/')
                types.push({
                    type: temp[temp.length-1],
                    name: key2,
                    sign: 1
                })
            }
        }
        componentTypes[key] = types
    }
    let fileData = ''
    let keys = Object.keys(componentTypes)
    const dirs = resultPath.split('/')
    if (dirs.length>1) {
        dirs.splice(dirs.length-1, 1)
        createDir(dirs)//创建文件夹
    }
    for (let key in componentTypes) {
        if (componentTypes[key]['sign']) {
            if (keys.indexOf(componentTypes[key]['type']) !== -1) {
                renderTemplate(key, componentTypes[key])
            }
        }
        renderTemplate(key, componentTypes[key])
    }

    function handleType(item) {//处理类型
        let type = item['type']
        let sign = item['nullable']
        let nullstring = sign?' | null':'';
        if (type === 'array') {
            if (item['items']) {
                if (item['items']['$ref']) {
                    let temp = item['items']['$ref'].split('/')
                    return temp[temp.length-1]+'[]'+nullstring
                }
                return handleType(item['items'])+'[]'+nullstring
            }
            return '[]'+nullstring
        }
        if (type === 'integer') {
            return 'number'+nullstring
        }

        return type+nullstring
    }
    function renderTemplate(name, types) {
        let tempTypes = types.filter(item=> {//过滤掉不存在的类型
            if (item.sign) {
                return keys.indexOf(item.type) !== -1
            } else {
                return item
            }
        })
        ejs.renderFile(path.resolve(__dirname+`/template/types/index.ejs`), {name: name, types: tempTypes}, (err, data) => {
            if(err) throw err
        
            fileData = fileData + '\n' + data
            
        })
    }
    createDTS(resultPath);
    async function createDTS(path) {
        try {
            await stat(path)
        } catch (e) {
            const fdStream =createWriteStream(path+'.d.ts', (err) => {
                if (err) throw err
            })
            fdStream.write(fileData)
        }
    }
}

module.exports = {
    createSwaggerType: main
}


