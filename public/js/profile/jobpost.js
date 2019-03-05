console.log('hiii');

$.get('/',function(data){
    console.log(data)
    if(data.status_code != 2){
        window.location.href = '/views/index.html';
    }
})

$('#post_job').submit(function(e){
    e.preventDefault()
    console.log('hey form is submited..')
    var res = {};
    $("#post_job input,#post_job textarea").each(function(i, obj) {
	    res[obj.name] = $(obj).val();
    })
    console.log(res);
        
    if(!res.job_title || !res.dept || !res.jd){
        let element = '<p class="alert alert-danger alert-dismissible" id="msg">'
                    + '<button type="button" class="close" data-dismiss="alert">&times;</button>'
                    + '<strong id="msg">Please fill all the fields.</strong>';
                    + '</p>'              
        $('#msg_div').empty().html(element)
    }else{
        $.post('/api/postjob',res,function(data){
            console.log(data)
            if(data.status_code == -9){
                console.log(data.msg)
            }else if(data.status_code == -20){
                console.log(data.msg)
                let element = '<p class="alert alert-danger alert-dismissible" id="msg">'
                            + '<button type="button" class="close" data-dismiss="alert">&times;</button>'
                            + '<strong id="msg">'+ data.msg +'</strong>';
                            + '</p>'              
                $('#msg_div').empty().html(element)
            }else if(data.status_code == 1){
                console.log(data.msg)
                let element = '<p class="alert alert-success alert-dismissible" id="msg">'
                            + '<button type="button" class="close" data-dismiss="alert">&times;</button>'
                            + '<strong id="msg">'+ data.msg +'</strong>';
                            + '</p>'              
                $('#msg_div').empty().html(element)
                $('input[type="text"],textarea').val('')
            }
        })
    }
    
})


