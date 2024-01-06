$(document).ready(function() {
    $.getJSON('/api/mqttclient/info',function(data) {
        var parsedUrl = new URL(data.MQTT_URL);
        var match = data.MQTT_URL.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        let hostname = (match && match[2]);

        if(data.MQTT_URL.indexOf('@') > 0) {
            match = data.MQTT_URL.match(/@([^/]+)/);
            hostname = match && match[1];
        }
        $('#restapi').val('http://'+(hostname)+':18083');
        $('#MQTT_URL').html(data.MQTT_URL);
    });

    $('#createEaf').click(function() {
        $.ajax({
            type: "POST",
            url:"/api/mqttclient/emqxApiPost",
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            data: JSON.stringify({
                restapi: $('#restapi').val() + '/api/v5/authentication/password_based%3Abuilt_in_database/users',
                apikey: $('#apikey').val(),
                apisecret: $('#apisecret').val(),
                payload: {
                    password: $('#eafPassword').val(),
                    user_id: $('#eafUser').val()
                }
            }),
            success: function(data) {
                if(data.user_id == 'stromdao-eaf') {
                    $('#createEaf').attr('disabled','disabled');
                    $('#createEaf').removeClass('btn-primary');
                    $('#createEaf').removeClass('btn-danger');
                    $('#createEaf').addClass('btn-success');
                }
            },
            error: function(error) {
                console.error(error);
                $('#createEaf').removeClass('btn-primary');
                $('#createEaf').addClass('btn-danger');
            }
        });
    });
    $('#sendAuth').click(function() {
        $.ajax({
            type: "POST",
            url:"/api/mqttclient/emqxApiPost",
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            data: JSON.stringify({
                restapi: $('#restapi').val() + '/api/v5/authorization/sources/built_in_database/rules/users',
                apikey: $('#apikey').val(),
                apisecret: $('#apisecret').val(),
                payload: [
                    {
                      "rules": [
                        {
                          "action": "all",
                          "permission": "allow",
                          "topic": "stromdao-eaf/#",
                          "retain": "all",
                        }
                      ],
                      "username": "stromdao-eaf"
                    }
                  ]
            }),
            success: function(data) {
                console.log(data);
            }
        });
    });
    $('#openEMQX').click(function() {
        window.open( $('#restapi').val(), "_blank");
    });
});