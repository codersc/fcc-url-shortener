var port = process.env.PORT || 8080;
var id = 0;
var symbols = [
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '0','1','2','3','4','5','6','7','8','9'
];
var dburl = process.env.MONGOLAB_URI;
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

mongo.connect(dburl, function(err, db) {
    if (err) {
        throw err;
    } 
    db.collection('tiny-urls').remove({});
    db.createCollection('tiny-urls');
});

app.get('/*', function (req, res) {
    var url = req.params[0];
    var urlPatt = /http:\/\/www\.[a-z]{1,63}\.com/i;
    var match = urlPatt.exec(url)
    if (match) {
        mongo.connect(dburl, function(err, db) { 
            if (err) {
                throw err;
            }
            var urls = db.collection('tiny-urls');
            urls.find({
                long: url 
            }).toArray(function(err, docs) {
                if (err) {
                    throw err;
                }
                if (docs.length > 0) {
                    res.json({ original_url: url, short_url: docs[0].short });
                } else {
                    id++;
                    var short = toB62(id);
                    urls.insert({ long: url, short: short }, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        res.json({ original_url: url, short_url: short });
                    });
                }
                db.close();
            });
        });        
    } else if (url == "") {
        res.send('usage: add a new url to the one in the browser and get a shortened one back');
    } else {
        mongo.connect(dburl, function(err, db) {
            if (err) {
                throw err;
            } 
            var urls = db.collection('tiny-urls');
            urls.find({
                short: url
            }).toArray(function(err, docs) {
                if (err) {
                    throw err;
                }
                if (docs.length > 0) {
                    res.redirect(docs[0].long);
                } else {
                    res.json({ error: "URL is invalid" });
                }
            });            
        });
    }
})

app.listen(port);