$( document ).ready(function() {
    $('#hosts').on("change keyup paste",function() {
        validateTextarea($(this))
    });
    $("#btn").click(
		function(){
		    $("body").css("cursor", "progress");
		    $("#btn").prop('disabled', true);
		    $("#hosts").prop('disabled', true);
		    $("#btn").css("cursor", "not-allowed");
		    $("#hosts").css("cursor", "not-allowed");
		    $("#result").html('')
            console.time('FirstWay');
			sendAjaxHosts();
			return false;
		}
	);
});


function sendAjaxHosts(){
    var url = "/ping/"
    token = $('input[name="csrfmiddlewaretoken"]').val()
    $.ajax({
        type: "POST",
        url: url,
        data: {hosts: $('#hosts').val(),csrfmiddlewaretoken: token},
        success: function(data){
            showPingResult(data)
        },
        error: function(data){
            showErrorResult()
        },
    })
}

function showPingResult(data){
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#hosts").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#hosts").css("cursor", "default");
    var items = [];
    $.each( data, function( index, element ) {
        $.each( element, function( key, val ) {
            if (val[0]){
                my_class = 'table-success';
                reach = 'Доступен'
            } else {
                my_class = 'table-danger';
                reach = 'Недоступен'
            }
            number = index + 1
            items.push( '<tr id="'+key+'" class="'+my_class+'"><td scope="row">'+number+'</td><td>'+
            key+'</td><td>'+reach+'</td><td>'+val[1]+'</td></tr>' );
        });
    });

    start = '<table class="table table-hover table-bordered"><thead><tr class="table-dark">'+
    '<th scope="col">№</th><th scope="col">Хост</th><th scope="col">Доступность</th><th scope="col">Адрес</th></tr></thead><tbody>'
    end = '</tbody></table>'
    my_html = start+items.join("")+end
    $("#result").html(my_html)
    console.timeEnd('FirstWay');
}

function showErrorResult(){
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#hosts").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#hosts").css("cursor", "default");
    my_html = '<div class="alert alert-danger" role="alert"> Ошибка выполнения </div>'
    $("#result").html(my_html)
    console.timeEnd('FirstWay');
}

function validateTextarea(element) {
    $("#hosts").val($("#hosts").val().replace(",","."));
    $("#hosts").val($("#hosts").val().replace(/[^a-zA-Z0-9/.\n]/g,""));
    if (element.is(":valid")) {
        $("#btn").prop('disabled', false);
        $("#btn").css("cursor", "default");
    }
    else {
        $("#btn").prop('disabled', true);
        $("#btn").css("cursor", "not-allowed");

    }
}
