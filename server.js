var port = process.env.PORT || 8080;
var id = 0;
var symbols = [
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '0','1','2','3','4','5','6','7','8','9'
];
var dburl = 'mongodb://localhost:27017/learnyoumongo';
var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();

function toB62(num) {
    var digits = [];
    while (num > 0) {
        var remainder = Math.floor(num % 62);
        digits.push(remainder);
        num = Math.floor(num / 62)
    }
    digits = digits.reverse();

    var result = '';
    for (var i = 0; i < digits.length; i++) {
        var digit = digits[i];
        result += symbols[digit];
    }
    return result;
}

app.get('/:url', function (req, res) {
    id++;
    var url = req.params.url;
    var urlPatt = /http:\/\/www\.[a-z]{1,63}\.com/i;
    var match = urlPatt.exec(url)
    if (match) {
        mongo.connect(dburl, function(err, db) { 
            if (err) {
                console.log('err connecting to db');
                throw err;
            }
            db.listCollections({name: 'tiny-urls'})
                .next(function(err, collinfo) {
                    if (err) {
                        res.send('collection does not exist');
                    }
                    if (collinfo) {
                        res.send('collection exists');
                    }
                }); 
            db.close();
        });        
    } else {
        res.send('error');
    }
})

app.listen(port);