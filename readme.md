# Docs

### WYSIWYG document editor from code comments

## use :
- clone at root of your project
```bash
    git clone https://github.com/force1267/docs
```
- change to docs folder
```bash
    cd docs
```
- install nodejs dependencies
```bash
    npm i
```
> oh, you will need nodejs and npm !
- start the doc server
```bash
    node index.js
```
- put `// doc` comment in your codes (with space)
```javascript
    // doc name first|loop
    for(let i = 0; i < n; ++ i) {
        // ...
    }
```
> use `|` instead of spaces in doc name

> do not clear generated doc id in `// doc` comment

- go to [localhost](http://localhost) to see your doced files

- select you new doc and write details

- save it using `Ctrl + S` or save button
> changes will be saved inside `data/` directory