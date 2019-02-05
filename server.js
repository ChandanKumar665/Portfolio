var express = require('express')
var app = express()
var session = require('express-session')
var port = 4000
var login_obj = require('./api/api_login')

var bodyParser = require('body-parser');
app.use(session({secret:'shhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



var MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/"
var is_loggedin = false
var session_obj;
app.use(express.static(__dirname + '/'));

app.set('view engine', 'html');
app.set('views', __dirname);
app.listen(port)
console.log('server satarted runnig at '+port)


app.get('/',function(req,res){
	req.session.destroy(function(err){
		if(err){
			throw err
		}else{
			res.redirect('/views/index.html');
		}
	})
	
})

app.post('/api/login',function(req,res){
	let emp = req.body
	var user=''
	MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
		if(err){
			throw err
		}
		var dbo = db.db('portfolio')
		console.log('connection successful')
		var login_cred = {'uname':emp.username,'pass':emp.password}
		dbo.collection('users').findOne(login_cred,function(err,result){
			if(err){
				throw err
			}
			if(result != null){
				// loggedin successfully
				session_obj = req.session
				session_obj.fname = result.fname
				session_obj.email_id = result.email_id
				session_obj.is_superadmin = result.is_superadmin
				session_obj.user_id = result._id
				is_loggedin = true
				db.close();
				res.redirect("../views/profile/profile.html")
			}else{
				db.close()
				res.end('Oops! Wrong credentials.')
			}
		})
	})
})

app.get('/api/user',function(req,res){
	if(req.session){
		res.json(req.session)
	}else{
		res.json({})
	}
})

app.get('/api/joblist',function(req,res){
	if(req.session){
		if(req.session.is_superadmin){
			//means admin login
			MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
				if(err){
					throw err
				}
				var dbo = db.db('portfolio')
				dbo.collection('job').find().toArray(function(err,result){
					if(err)
						throw err
					db.close()
					res.json(result)
				})
			})
		}else if(!req.session.is_superadmin && req.session.is_employer){
			//measn emplyoer login
				db.close()
		}else if(!req.session.is_superadmin && req.session.is_employee){
				db.close()
		}
	}else{
		res.json({})
	}
})

app.post('/api/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			throw err
		}else{
			res.redirect('/views/index.html')
		}
	})
})

app.post('/api/postjob',function(req,res){
	if(req.session == null){
		res.end('please login first')
	}
	if(req.body.job_title == '' || req.body.jd == '' || req.body.dept == ''){
		res.redirect('/views/profile/jobpost.html')
	}
	var job = {'job_title':req.body.job_title,
				'dept':req.body.dept,
				'job_description':req.body.jd.trim(),
				'posted_by':req.session.user_id,
				'create_time':new Date(),
				'updated_by':req.session.user_id
				}
	if(job != null){
		MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
			if(err)
				throw err
			var dbo = db.db('portfolio')
			dbo.collection('job').insertOne(job,function(err,result){
				if(err)
					throw err
				if(result != null){
					db.close()
					res.redirect('/views/profile/profile.html')
				}
			})
		})
	} else {
		res.redirect('./jobpost.html')
	}
})