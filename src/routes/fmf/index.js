var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const path = require('path');
const mysql = require('mysql');
const adminRouter = require('./admin');
const dt = require('./datetime.js');
const config = require('./config.js');

const pool = mysql.createPool(config.dbOpts);
const name = "La Radio di Biagi";

router.use('/admin', adminRouter);
router.use('/public', express.static(path.join(__dirname, '..', '..', 'public', 'fmf', 'public')));

router.post('/recieved', checkMagic, checkToken, function(req, res, next){
    console.log(req.body);
    var values = [[req.body.token, req.body.message, dt.getIsoFullDateTime()]];
    pool.query(newViewQuery, [values], function(error, results){
        if (error) throw error;
	res.sendStatus(200);
    });
});

router.get('/recieved', function(req, res, next){
    next(createError(403));
});

router.post('/token', checkMagic, function(req, res, next){
    console.log(req.body);
    pool.query(newTokenQuery, function(error, result){
        if (error) throw error;
	res.status(200).send(result.insertId.toString());
    });
});

router.get('/token', function(req, res, next){
    next(createError(403));
});

const newTokenQuery = "INSERT INTO Token() VALUES ()";
const newViewQuery = "INSERT INTO Viewed (TokenID, MessageID, ViewTime) VALUES ?";

router.get('/', function(req, res, next) {
  res.render('fmf/index', { title: name });
});

router.get('/bug', function(req, res, next){
    res.render('fmf/bug');
});

router.post('/bug', function(req, res, next){
    const fs = require('fs');
    var b = req.body;
    var status = "Zpráva uspěšně odeslána.";
    if (b && b.report){
        fs.appendFile('./bugs', dt.getIsoFullDateTime() + "\n" + b.report.toString() + "\n\n", function(err){
            if (err){
                console.log(err);
                status = "Nepodařilo se odeslat. Zkuste to znovu.";
            }
        });
    } else {
        status = "Nepodařilo se odeslat. Zkuste to znovu.";
    }
    res.render('fmf/bug-sent', {status: status});
});

router.get('/changelog', function(req, res, next){
    res.render('fmf/changelog');
});

router.get('/install', function(req, res, next){
    res.render('fmf/instructions');
});

router.get('/feedback', function(req, res, next){
    res.render('fmf/feedback');
});

router.post('/feedback', function(req, res, next){
    const fs = require('fs');
    var b = req.body;
    var status = "Zpráva uspěšně odeslána.";
    if (b && b.report){
        fs.appendFile('./feedback', dt.getIsoFullDateTime() + "\n" + b.report.toString() + "\n\n", function(err){
            if (err){
                console.log(err);
                status = "Nepodařilo se odeslat. Zkuste to znovu.";
            }
        });
    } else {
        status = "Nepodařilo se odeslat. Zkuste to znovu.";
    }
    res.render('fmf/bug-sent', {status: status});
})

function checkMagic(req, res, next){
    if (!req.body || req.body.magic != config.userMagic){
        next(createError(403));
    }
    next();
}

function checkToken(req, res, next){
    var exists = false;

    pool.query('SELECT * FROM Token', function(error, result, fields){
        if (error) throw error;
        result.forEach(row => {
            if (row.TokenID == req.body.token){
            	exists = true;
	    }
        });
	if (exists){
	    next();
	} else {
	    next(createError(403));
	}
    })
}

module.exports = router;
