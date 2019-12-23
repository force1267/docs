const fs = require('fs')
const path = require('path')

const root = process.argv[2]
const exclude = ["docs", ".png", ".svn", ".user", ".vscode", ".ico"]
const test = name => {
    for(var ptn of exclude) {
        if((new RegExp(ptn)).test(name)) {
            return true
        }
    }
    return false
}
const jn = (...args) => path.join(...args)

var ids = [0].concat(
    fs.readdirSync("./data")
    .filter(n => n !== "data.json")
    .map(n => n.split('.')[0])
    .map(s => parseInt(s))
)

function dfs(start) {
    let result = {}
    let files = fs.readdirSync(start)
    for(let file of files) {
        let p = jn(start, file)
        if(test(file)) continue
        try {
            let dir = fs.readdirSync(p)
            result[file] = dfs(p)
        } catch (e) {
            // is not dir
            if(e.code === "ENOTDIR") {
                var code = fs.readFileSync(p).toString()
                let lines = code.split("\r\n")
                
                let filedata = result[file] = []
                for(let i in lines) {
                    let line = lines[i]
                    if(/\/\/ doc/.test(line)) {
                        let at = line.indexOf("// doc")
                        let doc = line.slice(at + 7).split(' ')
                        var id = parseInt(doc[0]).toString() === 'NaN' ? false : parseInt(doc[0])
                        var name = null;
                        for(var ii = 0; ii < doc.length; ii ++) {
                            let token = doc[ii];
                            if(token === 'name') {
                                name = doc[ii + 1];
                            }
                        }

                        if(id) {
                            ids.push(id)
                            ids = ids.sort()
                            if(!fs.existsSync(`./data/${id}.html`)) {
                                fs.writeFileSync(`./data/${id}.html`, ``)
                            }
                            filedata.push({ id, name })
                        } else {
                            id = ids[ids.length - 1] + 1
                            ids.push(id)
                            fs.writeFileSync(`./data/${id}.html`, ``)
                            let left = lines[i].slice(0, at + 6)
                            let right = lines[i].slice(at + 7)
                            lines[i] = left + " " + id + " " + right
                            code = lines.join("\r\n")
                            fs.writeFileSync(p, code)
                            filedata.push({ id, name })
                        }
                    }
                }
            }
        }
    }
    return result
}

function clean(root) {
    if(root instanceof Array) {
        // leaf
        return root.length !== 0;
    }
    var good = false
    for(var i in root) {
        var c = clean(root[i])
        if(c) {
            good = true
        } else {
            delete root[i];
        }
    }
    return good;
}

const data = dfs(root)
clean(data)
fs.writeFileSync("./data/data.json", JSON.stringify(data))

require('./server.js')