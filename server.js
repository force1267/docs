const fs = require('fs')
const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();

const data = require('./data/data.json')

function resolve(url) {
    var rp = url.slice(1).split("/")
    var crr = data
    for(var r of rp) {
        if(r === '') {
            continue
        } else if(parseInt(r).toString() !== 'NaN') {
            return `<div id="editor">
                ${fs.readFileSync(`./data/${r}.html`).toString()}
            </div>
            <script>
                var quill = new Quill('#editor', {
                    modules: {
                        toolbar: [
                            ['link', 'image'],
                            // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                            
                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                            ['blockquote', 'code-block'],
                            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            
                            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                            [{ 'font': [] }],
                            
                            [{ 'direction': 'rtl' }, { 'align': [] }],
                            // ['clean']                                         // remove formatting button
                            ['save']
                        ]
                    },
                    placeholder: 'اینجا بنویس',
                    theme: 'snow'
                })
            </script>`
        } else if(crr instanceof Array) {
            crr = crr[crr.indexOf(r)]
        } else if(typeof crr[r] === 'object') {
            crr = crr[r]
        }
    }

    if(crr instanceof Array) {
        var res = `<h1 class="index">${url}</h1>`
        for(var ii = 0; ii < crr.length; ii ++) {
            let id = crr[ii].id
            let name = crr[ii].name
            res += `<a href="${path.join(url, id.toString())}" class='index'>${name ? name.split('|').join(' ') : id}</a><br>`
        }
        return res
    } else if(typeof crr === 'object') {
        var res = `<h1 class="index">${url}</h1>`
        for(var i in crr) {
            res += `<a href="${path.join(url, i)}" class='index'>${i}</a><br>`
        }
        return res
    }
}

app.use((req, res, next) => {
    if(req.url.indexOf("/docs_app_") === 0) {
        return next();
    }
    var html = resolve(req.url)
    var index = fs.readFileSync("./public/index.html").toString()
    var at = index.indexOf("<ssr>")
    var left = index.slice(0, at)
    var right = index.slice(at + 5)
    var result = left + html + right
    return res.send(result)
})

app.use(bodyParser.json());
app.post("/docs_app_update", (req, res) => {
    const { content, id } = req.body
    if(fs.existsSync(`./data/${id}.html`)) {
        try {
            fs.writeFileSync(`./data/${id}.html`, content)
            return res.json("ok")
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        return res.status(400).json("id does not exist")
    }
})
app.use("/docs_app_public", express.static("./public"));

app.listen(80);
console.log("               [  http://localhost/  ]")