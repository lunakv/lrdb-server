function getIsoDate(date){
    var now = date ? new Date(date) : new Date();
    var y = now.getFullYear();
    var m = (now.getMonth() + 1).toString().padStart(2, '0');
    var d = (now.getDate()).toString().padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function getTime(date){
    var now = date ? new Date(date) : new Date();
    var h = (now.getHours()).toString().padStart(2, '0');
    var m = (now.getMinutes()).toString().padStart(2, '0');
    return h + ":" + m;
}

function getFullTime(date){
    var now = date ? new Date(date) : new Date();
    var s = (now.getSeconds()).toString().padStart(2, '0');
    var m = (now.getMinutes()).toString().padStart(2, '0');
    var h = (now.getHours()).toString().padStart(2, '0');
    return h + ":" + m + ":" + s
}

function getIsoDateTime(date){
    return getIsoDate(date) + 'T' + getTime(date);
}

function getIsoFullDateTime(date){
    return getIsoDate(date) + 'T' + getFullTime(date);
}

function getCzDate(date){
    var now = date ? new Date(date) : new Date();
    var y = now.getFullYear();
    var m = (now.getMonth() + 1);
    var d = (now.getDate());
    return d + '. ' + m + '. ' + y;
}

function getCzDateTime(date){
    return getCzDate(date) + ' ' + getTime(date);
}

module.exports = {
    getIsoDate: getIsoDate,
    getTime: getTime,
    getFullTime: getFullTime,
    getIsoDateTime: getIsoDateTime,
    getIsoFullDateTime: getIsoFullDateTime,
    getCzDate: getCzDate,
    getCzDateTime: getCzDateTime,
};

