$( document ).ready(function() {
    validate($('#ip'))
    $('#ip').on("change keyup paste",function() {
        validate($(this))
    });
    $("#btn").click(
		function(){
		    $("body").css("cursor", "progress");
		    $("#btn").prop('disabled', true);
		    $("#ip").prop('disabled', true);
		    $("#oid").prop('disabled', true);
		    $("#btn").css("cursor", "not-allowed");
		    $("#ip").css("cursor", "not-allowed");
		    $("#oid").css("cursor", "not-allowed");
		    $("#result").html('')
            console.time('FirstWay');
			sendAjax();
			return false;
		}
	);
});


function sendAjax(){
    if ($('#oid').val() == '') {
        showErrorResult()
    }
    else {
        var url = "/snmp/"
        token = $('input[name="csrfmiddlewaretoken"]').val()
        $.ajax({
            type: "POST",
            url: url,
            data: {
                    ip: $('#ip').val(),
                    oid: $('#oid').val(),
                    csrfmiddlewaretoken: token
                  },
            success: function(data){
                showResult(data)
            },
            error: function(data){
                showErrorResult()
            },
        })
    }
}

function showResult(data){
    console.log(data)
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#ip").prop('disabled', false);
    $("#oid").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#ip").css("cursor", "default");
    $("#oid").css("cursor", "default");
    if (data['status']=='error'){
        showErrorResult()
    } else {
        var result =[]
        $.each( data['data'], function( number, val ) {
            result.push( '<tr><td scope="row">'+val[0]+'</td><td>'+val[1]+'</td></tr>' );
        });
        start = '<table class="table table-hover table-bordered mt-3"><thead><tr class="table-dark">'+
        '<th scope="col">OID</th><th scope="col">Значение</th></tr></thead><tbody>'
        end = '</tbody></table>'
        my_html = start + result.join("") + end
        $("#result").html(my_html)
        console.timeEnd('FirstWay');
    }


}

function showErrorResult(){
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#ip").prop('disabled', false);
    $("#oid").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#ip").css("cursor", "default");
    $("#oid").css("cursor", "default");
    my_html = '<div class="alert alert-danger" role="alert"> Ошибка выполнения </div>'
    $("#result").html(my_html)
    console.timeEnd('FirstWay');
}

function validate(element) {
    element.val(element.val().replace(",","."));
    element.val(element.val().replace(/[^0-9.]/g,""));
    if (element.is(":valid")) {
        element.removeClass("is-invalid")
        element.addClass("is-valid")
        $("#btn").prop('disabled', false);
        $("#btn").css("cursor", "default");
    }
    else {
        element.removeClass("is-valid")
        element.addClass("is-invalid")
        $("#btn").prop('disabled', true);
        $("#btn").css("cursor", "not-allowed");

    }
}
