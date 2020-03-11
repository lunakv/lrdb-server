let config = { 
	dbOpts: {
		host : 'localhost',
		port : 3306,
		user : 'user',
		password : 'password',
		database : 'la_radio'
	},

	adminName : 'admin',
	adminPwd : 'admin_password',
	userName : 'user',
	userPwd : 'user_password',

	userMagic : "tOSaMU0WNeWcLprLF4WOOGo91RdoCDQu2unAJPVLr6gAcZMRWUX430DhUX9IJyR6wAra1VmfTt92",
	firebaseURL : 'https://*project*.firebaseio.com',
	firebaseTopic : 'message_topic'
};

module.exports = config;
