$( document ).ready(function() {
	$('#mac_input').on("change keyup paste input",function() {
        validation('#mac_input');
    });
    $('#hosts').on("change keyup paste input",function() {
        $("#hosts").val($("#hosts").val().replace(",",".").replace(/[^a-zA-Zа-яА-Я0-9.\n]/g,""));
        validation('#hosts');
    });
    $('#ip').on("change keyup paste input",function() {
        $("#ip").val($("#ip").val().replace(",",".").replace(/[^0-9.]/g,""));
        validation('#ip');
    });
    $('#oid').on("change keyup paste input",function() {
        validation('#oid');
    });
    $("#btn").click(
        function(){
            console.time('FirstWay');
            sendAjax();
            return false;
        }
	);
});

function validation(id) {
    var element = $(id)
    if (element.is(":valid")) {
        element.removeClass("is-invalid")
        element.addClass("is-valid")
        $("#btn").prop('disabled', false);
    }
    else {
        element.removeClass("is-valid")
        element.addClass("is-invalid")
        $("#btn").prop('disabled', true);
    }
}

function beforeSendAjax(){
    var siblings = $("#btn").siblings();
    siblings.prop('disabled', true);
    siblings.css("cursor", "not-allowed");
    $("body").css("cursor", "progress");
    $("#btn").prop('disabled', true);
    $("#btn").css("cursor", "not-allowed");
    $("#result").html('')
}

function afterSendAjax(){
    var siblings = $("#btn").siblings();
    siblings.prop('disabled', false);
    siblings.css("cursor", "default");
    $("body").css("cursor", "default");
    $("#btn").prop('disabled', false);
    $("#btn").css("cursor", "default");
}

function sendAjax(){
    beforeSendAjax()
    var url = $('ajax_form').attr('action');
    var token = $('input[name="csrfmiddlewaretoken"]').val();

    switch ($("#btn").parent().attr("id")) {
        case "mac":
            data_input = $('#mac_input').val()
            break;
        case "ping":
            data_input = $('#hosts').val()
            break;
        case "ip_calc":
            data_input = [$('#ip').val(), $('#prefix').val()]
            break;
        case "snmp":
            data_input = [$('#ip').val(), $('#oid').val()]
            break;
        default:
            data_input = ''
            break;
    }
    $.ajax({
        type: "POST",
        url: url,
        data: {data_input: data_input, csrfmiddlewaretoken: token},
        success: function(data){
            afterSendAjax()
            if (data['success']==true) {
                showResult(data_input, data['data'])
            }else {
                showErrorResult(data['detail'])
            }
        },
        error: function(data){
            afterSendAjax()
            showErrorResult('Ошибка выполнения запроса')
        },
        timeout: 60000,
    })
}

function showResult(input_val, data){
    switch ($("#btn").parent().attr("id")) {
        case "mac":
            my_html = get_html_mac(input_val, data);
            break;
        case "ping":
            my_html = get_html_ping(input_val, data);
            break;
        case "ip_calc":
            my_html = get_html_ip_calc(input_val, data);
            break;
        case "snmp":
            my_html = get_html_snmp(input_val, data);
            break;
        default:
            my_html = ''
            break;
    }
    $("#result").html(my_html)
    console.timeEnd('FirstWay');
}

function showErrorResult(text){
    my_html = '<div class="alert alert-danger" role="alert">'+text+'</div>'
    $("#result").html(my_html)
    console.timeEnd('FirstWay');
}

function get_html_mac(input_val, data) {
    var items = [];
    console.log(data)
    $.each( data['vendor_detail'], function( key, val ) {
        items.push('<tr><th scope="row">'+key+'</th><td>'+val+'</td></tr>' );
    });
    var list_mac = [];
    $.each( data['mac_spelling'], function( number, val ) {
        list_mac.push( '<li class="px-1">'+val+'</li>' );
    });
    start_list_mac = '<ul class="list-unstyled">';
    end_list_mac = '</ul>';
    start = '<table class="table table-striped table-sm caption-top"><tbody><caption>'+
    'Производителем устройства с mac-адресом <b>'+input_val[0]+'</b> является компания:</caption>';
    end = '</tbody></table>' + start_list_mac + list_mac.join("") + end_list_mac;
    my_html = start + items.join("") + end;
    return my_html
}

function get_html_ping(input_val, data) {
    var items = [];
    $.each( data, function( index, element ) {
        $.each( element, function( key, val ) {
            if (val == 0){
                my_class = 'table-success';
                reach = 'Доступен';
            } else if (val == 1) {
                my_class = 'table-danger';
                reach = 'Недоступен';
            } else {
                my_class = 'table-danger';
                reach = 'Неправильный формат';
            }
            number = index + 1
            items.push( '<tr id="'+key+'" class="'+my_class+'"><td scope="row">'+number+'</td><td>'+
            key+'</td><td>'+reach+'</td></tr>' );
        });
    });
    start = '<table class="table table-hover table-bordered"><thead><tr class="table-dark">'+
    '<th scope="col">№</th><th scope="col">Хост</th><th scope="col">Доступность</th>';
    end = '</tbody></table>';
    my_html = start+items.join("")+end;
    return my_html
}

function get_html_ip_calc(input_val, data) {
    var items = [];
    var ip = data['ip'];
    items.push( '<tr><th scope="row">IP</th><td>'+ip+'</td></tr>' );
    var prefix = data['prefix'];
    items.push( '<tr><th scope="row">Bitmask</th><td>'+prefix+'</td></tr>' );
    var netmask = data['netmask'];
    items.push( '<tr><th scope="row">Netmask</th><td>'+netmask+'</td></tr>' );
    var wildcard = data['wildcard'];
    items.push( '<tr><th scope="row">Wildcard</th><td>'+wildcard+'</td></tr>' );
    var subnet = data['subnet']
    items.push( '<tr><th scope="row">Network</th><td>'+subnet+'</td></tr>' );
    var broadcast = data['broadcast'];
    items.push( '<tr><th scope="row">Broadcast</th><td>'+broadcast+'</td></tr>' );
    var hostmin = data['ip_min']
    items.push( '<tr><th scope="row">Hostmin</th><td>'+hostmin+'</td></tr>' );
    var hostmax = data['ip_max'];
    items.push( '<tr><th scope="row">Hostmax</th><td>'+hostmax+'</td></tr>' );
    var hosts = data['ip_all'];
    items.push( '<tr><th scope="row">Hosts</th><td>'+hosts+'</td></tr>' );
    start = '<table class="table table-hover table-bordered mt-3"><thead><tr class="table-dark">'+
    '<th scope="col">Имя</th><th scope="col">Значение</th></tr></thead><tbody>';
    end = '</tbody></table>';
    my_html = start + items.join("") + end;
    return my_html
}

function get_html_snmp(input_val, data) {
    var result =[];
    $.each( data, function( number, val ) {
        result.push( '<tr><td scope="row">'+val[0]+'</td><td>'+val[1]+'</td></tr>' );
    });
    start = '<table class="table table-hover table-bordered mt-3"><thead><tr class="table-dark">'+
    '<th scope="col">OID</th><th scope="col">Значение</th></tr></thead><tbody>'
    end = '</tbody></table>';
    my_html = start + result.join("") + end;
    return my_html
}