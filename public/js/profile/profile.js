var login_res = {}
$.get('/api/user',function(data){
	console.log(data)
	login_res = data
	$('#name').text(data.fname)
})
var hidden_inputs=[]
$.get('/api/joblist',function(data){
	var result_div = ''
	console.log(data)
	if(!login_res.is_superadmin){
		$('#btn_adduser').hide()
	}
	if(login_res.is_employee){
		$('#btn_jobpost').hide()
	}
	if (data.length >= 1) {
		for(var i in data){
			hidden_inputs.push(data[i])
			var d = new Date(data[i].create_time)
			date = d.toDateString().split(' ')
			result_div += ''
				+'<div data-id="" class="list-group-item list-group-item-action flex-column align-items-start " style="">'
           		+	'<div class="d-flex w-100 justify-content-between">'
           		+	'</div>'
           		+		'<div class="">'
           		+			'<div class="row">'
           		+				'<div class="col-md-8 col-lg-8 col-xl-8">'
           		+					'<label for=""><strong>Job Title:</strong></label>&nbsp;'+data[i].job_title	 
           		+				'</div>'
           		+				'<div class="col-md-4 col-lg-4 col-xl-4">'
           		+					'<label for=""><strong>Posted On:</strong></label>&nbsp;'+date[2]+' '+date[1]+', '+date[3]	 
           		+				'</div>'
           		+			'</div>'
           		+		'</div>'
		        +   	'<div class="">'
		        +			'<label for=""><strong>Department:</strong></label>&nbsp;'+data[i].dept 
		        +  		'</div>'
		        +		'<div class="form-group purple-border">'
  				+			'<label for="job_description">Job Description:</label>'
			  	+			'<textarea class="form-control" id="job_description" readonly rows="3">'+data[i].job_description+'</textarea>'
				+		'</div>'
				+		'<div class="row">'
		        +			'<div class="col-xl-8 col-lg-8 col-md-8">' 
		        +				'<label for=""><strong>Posted BY:</strong></label>&nbsp;'+data[i].user_details[0]['fname']
		        +  			'</div>';
		    if(login_res.is_superadmin || login_res.user_id == data[i].posted_by){	
				result_div += ''
		        +			'<div class="col-xl-4 col-lg-4 col-md-4">'
		        +				'<label for="">Action:</label>&nbsp;'
		        +				'<a class="edit" data-title="" data-toggle="modal" data-id="'+data[i]._id+'" data-target="#editmodal"><i class="far fa-edit" style="cursor:pointer"></i></a> | '
		        +				'<a class="remove" data-title="'+data[i].job_title+'" data-toggle="modal" data-id="'+data[i]._id+'" data-target="#deleteModal"><i class="fas fa-trash-alt" style="cursor:pointer"></i></a>'
		        +			'</div>';
			}

				result_div += ''
		        +		'</div>'         
		        +'</div>';
		}
		$('#result').html(result_div)
	}
})


$(document).on('click','.remove',function(e){
	var id = $(this).data('id')
	var title = $(this).data('title')
	$('#delete').data('id',id)
	$('#modalbody').html('Are you sure you want to delete job <strong>'+title+'</strong> ?')
})

$(document).on('click','.edit',function(e){
	var id = $(this).data('id')
	for(var i in hidden_inputs){
		if(hidden_inputs[i]._id == id){
			$('#edit_job_title').val('')
			$('#edit_department').val('')
			$('#edit_description').val('')
			$('#edit_job_title').val(hidden_inputs[i].job_title)
			$('#edit_department').val(hidden_inputs[i].dept)
			$('#edit_description').val(hidden_inputs[i].job_description)
			$('#hidden_id').val(id)
			break
		}
	}
})

$('#delete').click(function(){
	var id = $(this).data('id')
	$.get('/api/delete/'+id,function(data){
		if(data.msg == 1){
			window.location.href = '/views/profile/profile.html';
		}
	})
})