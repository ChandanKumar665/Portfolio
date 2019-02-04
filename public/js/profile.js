console.log('hiiii')

$.get('/api/user',function(data){
	console.log(data)
	$('#name').text(data.fname)
})

// $.get('/api/joblist',function(data){
// 	console.log(data)
// })