var express = require('express')
// var router = require('router')
var app = express()
var port = 4000

var path = require('path')
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose')
var url = "mongodb://localhost:27017/"
// var login_obj = require('./api/api_login')
var session = require('express-session')
app.use(session({secret: 'imlovingit',resave:false,saveUninitialized:true}))

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/'));

app.engine('html',require('ejs').renderFile)
app.set('view engine', 'html');
app.set('views',path.join(__dirname,'views'));

app.listen(port)
console.log('server satarted runnig at '+port)


app.get(['/','/views/index.html',''],function(req,res){
	console.log(req.session.is_loggedin)
	console.log(req.session)
	if(req.session && req.session.is_loggedin){
		console.log('inside')
		res.redirect('/views/profile/profile.html');
	}else{
		console.log('out')
		res.redirect('/views/index.html');
	}
})

app.post('/api/login',function(req,res){
	MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
		if(err){
			throw err
		}
		console.log('connection successful')
		var dbo = db.db('portfolio')
		var login_obj = {
							uname:req.body.username,
							pass:req.body.password
						}
		dbo.collection('users').findOne(login_obj,function(err,user){
			if(err){
				throw err
			}
			// console.log(user)
			if(user){
				// loggedin successfully
				// req.session
				req.session.fname = user.fname
				req.session.user_id = user._id
				req.session.email_id = user.email_id
				req.session.is_superadmin = user.is_superadmin
				req.session.is_employee = user.is_employee
				req.session.is_employer = user.is_employer
				req.session.is_loggedin = true
				// console.log(req.session)
				db.close();
				res.json({'msg':'login success','status_code':2})
				// res.render(__dirname+'/views/profile/profile.html',{'msg':'whatsupp'})
			} else {
				db.close()
				res.json({'msg':'Oops!wrong credentials.','status_code':-2})
			}
			
		})

	})
})

// app.get('/api/user',login_obj.user)
app.get('/api/user',function(req,res){
	// console.log(req.session.is_loggedin)
	if(req.session && req.session.is_loggedin){
		res.json(req.session)
	} else {
		res.json({'msg':'please login to continue.','status_code':-2})
	}
})

app.get('/api/joblist',function(req,res){
	if(req.session && req.session.is_loggedin){
		//means user logged in
		MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
			if(err){
				throw err
			}
			var dbo = db.db('portfolio')
			var join = {
						$lookup:
							{
								from:'users',
								localField:'posted_by',
								foreignField:'_id',
								as:'user_details'	
							}
						}
			dbo.collection('job').aggregate([join]).sort({'create_time':-1}).toArray(function(err,result){
				if(err){
					// throw err
					db.close()
					res.json({'msg':'something went wrong','status_code':-20})
				}	
				db.close()
				res.json(result)
			})
		})
} else {
	// db.close()
	res.json({'msg':'please login to continue.','status_code':-2})
	}
})

app.post('/api/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			// db.close()
			res.json({'msg':'something went wrong','status_code':-20})
		}else{
			res.json({'msg':'logout successfully','status_code':-2})
			// res.redirect('../views/index.html')
		}
	})
})

app.post('/api/postjob',function(req,res){
	if(!req.session && !req.session.is_loggedin){
		res.json({'msg':'please login to continue.','status_code':-2})
	}
	else if(req.body.job_title == '' || req.body.jd == '' || req.body.dept == ''){
		// console.log('all are empty')
		res.json({'msg':'empty values sent','status_code':-9})
	}
	var job = {
				'job_title':req.body.job_title,
				'dept':req.body.dept,
				'job_description':req.body.jd.trim(),
				'posted_by':mongoose.Types.ObjectId(req.session.user_id),
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

app.post('/api/update',function(req,res){
	if(!req.session && !req.session.is_loggedin){
		res.redirect('/api/logout')
	}
	// console.log(req.body)
	if(req.body != '' || req.body != null){
		MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
			if(err)
				throw err
			var dbo = db.db('portfolio')
			var update_obj = {'_id':mongoose.Types.ObjectId(req.body.hidden_id)}
			var new_values = {$set:{'job_title':req.body.job_title,'dept':req.body.dept,'job_description':req.body.jd,'updated_time':new Date()}}
			dbo.collection('job').updateOne(update_obj,new_values,function(err,result){
				if(err)
					throw err
				if(result != null){
					console.log('one doc updated')
					db.close()
					res.redirect('/views/profile/profile.html')
				}
			})
		})
	}
	else {
		// db.close()
		res.redirect('/views/profile/profile.html')
	}
})

app.get('/api/delete/:id',function(req,res){
	if(!req.session && !req.session.is_loggedin){
		res.redirect('/api/logout')
	}
	if(req.params.id != '' || req.params.id != null){
		MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
			if(err)
				throw err
			var dbo = db.db('portfolio')
			var del_obj = {'_id':mongoose.Types.ObjectId(req.params.id)}
			dbo.collection('job').deleteOne(del_obj,function(err,result){
				if(err)
					throw err
				if(result != null){
					console.log('one doc deleted')
					db.close()
					res.json({'msg':1})
				}
			})
		})
	}
	else{
		// db.close()
		res.redirect('/views/profile/profile.html')
	}
})