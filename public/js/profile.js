console.log('hiiii')

$.get('/api/user',function(data){
	console.log(data)
	$('#name').text(data.fname)
})

$.get('/api/joblist',function(data){
	var result_div = ''
	
	if (data.length >= 1) {
		console.log('here')
		for(var i in data){
			result_div += ''
				+'<div data-id="" class="list-group-item list-group-item-action flex-column align-items-start " style="">'
           		+	'<div class="d-flex w-100 justify-content-between">'
           		+	'</div>'
           		+		'<div class="">'
           		+			'<label for=""><strong>Job Title:</strong></label>&nbsp;'+data[i].job_title 
           		+		'</div>'
		        +   	'<div class="">'
		        +			'<label for=""><strong>Department:</strong></label>&nbsp;'+data[i].dept 
		        +  		'</div>'
		        +		'<div class="form-group purple-border">'
  				+			'<label for="job_description">Job Description</label>'
			  	+			'<textarea class="form-control" id="job_description" readonly rows="3">'+data[i].job_description+'</textarea>'
				+		'</div>'
		        +		'<div class="">' 
		        +			'<label for=""><strong>Posted BY:</strong></label>&nbsp;'+data[i].posted_by 
		        +  		'</div>'         
		        +'</div>';
		}
		$('#result').html(result_div)
	}
})