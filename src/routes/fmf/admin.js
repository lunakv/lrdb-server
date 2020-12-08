var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var admin = require('firebase-admin');
var config = require('./config.js');
var dt = require('./datetime.js');
var pool = mysql.createPool(config.dbOpts);

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: config.firebaseURL 
});
  

router.get('/', checkSignIn, function(req, res, next){
    res.render('fmf/admin/index', {session: req.session.user});
});

// checks that either admin or user is signed in 
function checkSignIn(req, res, next){
    if (req.session && req.session.user){
        next();
    } else {
        res.redirect('/radio/admin/login');
    }
}

// checks that admin specifically is signed in
function checkAdmin(req, res, next){
    if (req.session && req.session.user == "admin"){
        next();
    } else if (req.session && req.session.user == "user") {
        res.redirect('/radio/admin/');
    } else {
        res.redirect('/radio/admin/login');
    }
}

router.get('/login', function(req, res){
    res.render('fmf/admin/login', {nosession: true});
});

router.post('/login', function(req, res){
    if (!req.body.name || !req.body.password){ 
        res.render('fmf/admin/login', {message: "Zadejte jméno i heslo", nosession: true});        
    } else if (req.body.name == config.adminName && req.body.password == config.adminPwd) {
        req.session.user = "admin";
        res.redirect('/radio/admin');
    } else if (req.body.name == config.userName && req.body.password == config.userPwd){
        req.session.user = "user";
        res.redirect('/radio/admin');
    } else {
        res.render('fmf/admin/login', {message: "Neplatné jméno nebo heslo", nosession: true});
    }
})

router.get('/logout', checkSignIn, function(req, res){
    req.session.destroy();
    res.redirect('/radio/admin/login');
})

router.get('/new-message', checkSignIn, function(req, res, next){
    res.render('fmf/admin/new-message', {message: "", date: dt.getIsoDate(), time: dt.getTime(), session: req.session.user});
})

router.post('/new-message', checkSignIn, function(req, res, next){
    var b = req.body;
    var duration;
    var multiplier;
    var start;
    if (req.session.user == "admin"){
        multiplier = parseFloat(b.multiplier);
        start = b.startdate && b.starttime ? b.startdate + ' ' + b.starttime : null;
        duration = parseInt(b.duration);
    } else {
        multiplier = 1;
        start = dt.getIsoFullDateTime();
        duration = 120;
        b.duration = 120;
    }
    if (b && b.message && start && b.duration && multiplier){
        if (isNaN(duration)){
            var error = "V poli 'Doba platnosti' musí být zadáno číslo";
            res.render('fmf/admin/new-message', {message: b.message, date: b.startdate, time: b.starttime, error: error, session: req.session.user});
        } else if (isNaN(multiplier) || multiplier <= 0){
            var error = "V poli 'Zpomalovač' musí být zadáno kladné číslo";
            res.render('fmf/admin/new-message', {message: b.message, date: b.startdate, time: b.starttime, error: error, session: req.session.user});
        }
         else if (!validMessage(b.message)){
            var error = "Povolena jsou pouze písmena bez diakritiky, čísla, čárka, tečka a mezera.";
            res.render('fmf/admin/new-message', {message: b.message, date: b.startdate, time: b.starttime, error: error, session: req.session.user});
        } else {
            var begin = start;
            if (new Date(begin).valueOf() < new Date().valueOf()){
                begin = dt.getIsoFullDateTime();
            }
            var values = [[b.message, begin, duration, multiplier]];
            pool.query(newMsgQuery, [values], function(error, results, fields){
                if (error) throw error;
                res.redirect('/radio/admin/messages');
            })
        }
    } else {
        var error = "Všechna pole musí být vyplněna";
        res.render('fmf/admin/new-message', {date: dt.getIsoDate(), time: dt.getTime(), error: error, session: req.session.user});
    }
})

router.get('/messages', checkAdmin, function(req, res, next){
    var activemsg;
    var pastmsg;
    var futuremsg;
    pool.query(activeMsgQuery, function(error, results, fields){
        if (error) throw error;
        activemsg = results;
        pool.query(pastMsgQuery, function(error, results, fields){
            if (error) throw error;
            pastmsg = results;
            pool.query(futureMsgQuery, function(error, results, fields){
                if (error) throw error;
                futuremsg = results;
                res.render('fmf/admin/messages', {format: dt.getCzDateTime, past: pastmsg, current: activemsg, future: futuremsg, session: req.session.user});
            })
        })
    })
})

router.get('/views', checkAdmin, function(req, res, next){
    pool.query(viewsQuery, function(error, results, fields){
        if (error) throw error;
        res.render('fmf/admin/log-views', {format: dt.getCzDateTime, table: results, title: "La Radio admin - Zobrazení", session: req.session.user});
    })    
})

router.get('/guide', checkSignIn, function(req, res, next){
    res.render('fmf/admin/guide', {session: req.session.user});
})

router.get('/timer', checkSignIn, function(req, res, next){
    res.render('fmf/admin/counter', {session: req.session.user});
})

router.get('/delete/:mid', checkAdmin, function(req, res, next){
    if (req.params && req.params.mid){
        pool.query(deleteMsgQuery, [req.params.mid], function(error, results, fields){
            if (error) throw error;
        })
    }

    res.redirect('/radio/admin/messages');
})

const readyToSendQuery = 'SELECT * FROM Message WHERE Begin <= NOW() AND DATE_ADD(Begin, INTERVAL Duration SECOND) >= NOW() AND MessageID NOT IN (SELECT MessageID FROM Sent) ORDER BY Begin DESC';
const activeMsgQuery = 'SELECT * FROM Message WHERE Begin <= NOW() AND DATE_ADD(Begin, INTERVAL Duration SECOND) >= NOW() ORDER BY Begin DESC';
const pastMsgQuery = 'SELECT * FROM Message NATURAL JOIN Sent ORDER BY Begin DESC';
const futureMsgQuery = 'SELECT * FROM Message WHERE Begin > NOW() ORDER BY Begin DESC';
const newMsgQuery = "INSERT INTO Message (Content, Begin, Duration, Multiplier) VALUES ?";
const viewsQuery = 'SELECT * FROM Viewed ORDER BY ViewTime DESC';
const sentMsgQuery = "INSERT INTO Sent (MessageID, Time) VALUES ?";
const deleteMsgQuery = "DELETE FROM Message WHERE MessageID = ?";

function validMessage(string){
    return /^[a-zA-Z0-9 ,.]+$/.test(string);
}

function sendMessage(id, message, duration, multiplier){
    var toSend = {
        data: {
            morse: message,
            id: id.toString(),
            multiplier: multiplier.toString() 
        },
        android: {
            ttl: parseInt(duration) * 1000,
	    priority: "HIGH"
        },
        topic: config.firebaseTopic
    };

    admin.messaging().send(toSend)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        var values = [[id, dt.getIsoDateTime()()]];
        pool.query(sentMsgQuery, [values], function(error, results, fields){
            if (error) throw error;
        })
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });

}

function pollDB(){
    pool.query(readyToSendQuery, function(error, results, fields){
        if (error) throw error;
        if (results){
            results.forEach(row => {
                sendMessage(row.MessageID, row.Content, row.Duration, row.Multiplier);
            });
        }
    })
}

setInterval(pollDB, 5000);

module.exports = router;
