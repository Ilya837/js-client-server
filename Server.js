const express = require("express");
const app = express();
const fs = require("fs");

const urlencodedParser = express.urlencoded({extended: false});

const jsonPars = express.json();

app.listen(8080);

app.use(express.static('public'));

app.set('view engine','ejs');



var reqSearch = "";

app.get('/taken',function (req,res){

    let result = fs.readFileSync('./private/library.json', 'utf8');

    result = JSON.parse(result);
    result = result.books;

    result = result.filter(val => (val.taken.length > 0));
    res.render('taken', {
        books: result
    })
})

app.get('/', function (req, res){

    let data = fs.readFileSync('./private/library.json', 'utf8');

    data = JSON.parse(data);

    let names = [];
    let authors = [];
    let publishers = [];

    for(let i in data.books) {
        publishers.push(data.books[i].publisher);
        names.push(data.books[i].name);
        for(let j in data.books[i].authors){
            authors.push(data.books[i].authors[j]);
        }
    }

    names = [...new Set(names)];
    authors = [...new Set(authors)];
    publishers = [...new Set(publishers)];
    res.render('search',{
        names: names,
        authors: authors,
        publishers:publishers
    })

})

app.get('/searchRes',function (req,res) {
    if(reqSearch != "") {
        let r = JSON.parse(reqSearch);

        let result = fs.readFileSync('./private/library.json', 'utf8');

        result = JSON.parse(result);
        result = result.books;


        if (r.ISBN != '') {
            result = result.filter(val => (val.ISBN == r.ISBN));
        }

        if (r.edition != '') {
            result = result.filter(val => ((val.ISBN.split('-'))[3] == r.edition));
        }

        if (r.author != '') {
            result = result.filter(function (val) {
                let tmp = false;
                for (i in val.authors) {
                    if ((val.authors[i]).includes(r.author)) {
                        tmp = true;
                        break;
                    }
                }
                return tmp;
            });
        }

        if (r.publisher != '') {
            result = result.filter(val => (val.publisher).includes(r.publisher));
        }

        if (r.bookName != '') {
            result = result.filter(val => (val.name).includes(r.bookName));
        }


        res.render('searchRes', {
            books: result
        })
    }
    else{
        res.render('searchRes', {
            books: []
        })
    }
})

app.post('/searchRes',jsonPars, function (req,res) {
    try {
        let result = fs.readFileSync('./private/library.json', 'utf8');

        result = JSON.parse(result);

        for(let i in result.books){
            if(result.books[i].ISBN == req.body.ISBN){
                let d =new Date();
                let text = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                (result.books[i]).taken.push(text);
                break;
            }
        }

        let text = JSON.stringify(result);

        fs.writeFileSync('./private/library.json', text, 'utf8');
        res.sendStatus(200);
    }
    catch(err){
        res.sendStatus(400);
    }


})

app.post('/taken',jsonPars, function (req,res) {
    try {
        let result = fs.readFileSync('./private/library.json', 'utf8');

        result = JSON.parse(result);

        for(let i in result.books){
            if(result.books[i].ISBN == req.body.ISBN){
                 result.books[i].taken.splice(result.books[i].taken.indexOf(req.body.DATE),1);
                break;
            }
        }

        let text = JSON.stringify(result);

        fs.writeFileSync('./private/library.json', text, 'utf8');
        res.sendStatus(200);
    }
    catch(err){
        res.sendStatus(400);
    }


})

app.post('/',urlencodedParser , function(req,res){

    reqSearch = JSON.stringify(req.body);
    res.redirect("/searchRes");
})



//app.listen();
