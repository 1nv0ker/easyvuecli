const { mkdirSync, stat } = require('fs')

async function createDir(dirs) {
    try {
        await stat(dirs.join('/'))
    } catch (e) {
        mkdirSync(dirs.join('/'), {recursive:true})
    }
}
module.exports = {
    createDir
}