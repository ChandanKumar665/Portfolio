
$('#loginform').submit(function(e) {
	e.preventDefault()
	console.log('hey form is submited')
	var res = {};
	$("#loginform input, #loginform checkbox:selected, #loginform select, #loginform textarea").each(function(i, obj) {
	    res[obj.name] = $(obj).val();
	})
	console.log(res)
	var login_obj = {'username':res.username,'password':res.password}
	$.post('/api/login',login_obj,function(data){
		console.log(data)
		if(data.msg == 1){
			//login success
			window.location.href = '/views/profile/profile.html';
		} else {
			$('#msg').text(data.msg)
			$('#msg_div').show()
		}
	})
})
