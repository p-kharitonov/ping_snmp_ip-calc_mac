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
		    $("#prefix").prop('disabled', true);
		    $("#btn").css("cursor", "not-allowed");
		    $("#ip").css("cursor", "not-allowed");
		    $("#prefix").css("cursor", "not-allowed");
		    $("#result").html('')
            console.time('FirstWay');
			sendAjaxIpCalc();
			return false;
		}
	);
});


function sendAjaxIpCalc(){
    var url = "/ip_calc/"
    token = $('input[name="csrfmiddlewaretoken"]').val()
    $.ajax({
        type: "POST",
        url: url,
        data: {
                ip: $('#ip').val(),
                prefix: $('#prefix').val(),
                csrfmiddlewaretoken: token
              },
        success: function(data){
            showIpCalcResult(data)
        },
        error: function(data){
            showErrorResult()
        },
    })
}

function showIpCalcResult(data){
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#ip").prop('disabled', false);
    $("#prefix").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#ip").css("cursor", "default");
    $("#prefix").css("cursor", "default");
    var items = [];
    var ip = data['ip']
    items.push( '<tr><th scope="row">IP</th><td>'+ip+'</td></tr>' );
    var prefix = data['prefix']
    items.push( '<tr><th scope="row">Bitmask</th><td>'+prefix+'</td></tr>' );
    var netmask = data['netmask']
    items.push( '<tr><th scope="row">Netmask</th><td>'+netmask+'</td></tr>' );
    var wildcard = data['wildcard']
    items.push( '<tr><th scope="row">Wildcard</th><td>'+wildcard+'</td></tr>' );
    var subnet = data['subnet']
    items.push( '<tr><th scope="row">Network</th><td>'+subnet+'</td></tr>' );
    var broadcast = data['broadcast']
    items.push( '<tr><th scope="row">Broadcast</th><td>'+broadcast+'</td></tr>' );
    var hostmin = data['hostmin']
    items.push( '<tr><th scope="row">Hostmin</th><td>'+hostmin+'</td></tr>' );
    var hostmax = data['hostmax']
    items.push( '<tr><th scope="row">Hostmax</th><td>'+hostmax+'</td></tr>' );
    var hosts = data['hosts']
    items.push( '<tr><th scope="row">Hosts</th><td>'+hosts+'</td></tr>' );

    start = '<table class="table table-hover table-bordered mt-3"><thead><tr class="table-dark">'+
    '<th scope="col">Имя</th><th scope="col">Значение</th></tr></thead><tbody>'
    end = '</tbody></table>'
    my_html = start+items.join("")+end
    $("#result").html(my_html)
    console.log(data);
    console.timeEnd('FirstWay');
}

function showErrorResult(){
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#ip").prop('disabled', false);
    $("#prefix").prop('disabled', false);
    $("#btn").css("cursor", "default");
    $("#ip").css("cursor", "default");
    $("#prefix").css("cursor", "default");
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
