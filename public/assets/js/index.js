$(document).ready(function() {
    const updateReading =  function() {
     
        $.getJSON('/api/mqttclient/processed',function(data) {
            let html = '<table class="table table-striped table-condesed">';
            html += '<thead>';
            html += '<tr><th>Time</th><th>meterId</th><th>reading</th><th>cons. total</th><th>cons. 1</th><th>cons. 2</th><th>cons. 3</th></tr>';
            html += '</thead>';
            html += '<tbody>';
            for(let i=0;i<data.length;i++) {
                if(typeof data[i].msg.consumption_virtual_1 == 'undefined') data[i].msg.consumption_virtual_1 = 0;
                if(typeof data[i].msg.consumption_virtual_2 == 'undefined') data[i].msg.consumption_virtual_2 = 0;
                if(typeof data[i].msg.consumption_virtual_3 == 'undefined') data[i].msg.consumption_virtual_3 = 0;

                html += '<tr>';
                html += '<td>'+new Date(data[i].time).toLocaleString()+'</td>';
                html += '<td>'+data[i].msg.meterId+'</td>';
                html += '<td>'+data[i].msg.reading+'</td>';
                html += '<td>'+data[i].msg.consumption+'</td>';
                html += '<td>'+data[i].msg.consumption_virtual_1+'</td>';
                html += '<td>'+data[i].msg.consumption_virtual_2+'</td>';
                html += '<td>'+data[i].msg.consumption_virtual_3+'</td>';
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            $('#processed').html(html);
        });

        $.getJSON('/api/mqttclient/readings',function(data) {
            let html = '<table class="table table-striped table-condesed">';
            html += '<thead>';
            html += '<tr><th>Time</th><th>meterId</th><th>reading</th><th>processed</th></tr>';
            html += '</thead>';
            html += '<tbody>';
            for(let i=0;i<data.length;i++) {
                html += '<tr>';
                html += '<td>'+new Date(data[i].time).toLocaleString()+'</td>';
                html += '<td>'+data[i].msg.meterId+'</td>';
                html += '<td>'+data[i].msg.reading+'</td>';
                if(data[i].msg.processed === true) {
                    html += '<td class="text-success"><i class="fa fa-check"></i> OK</td>';
                } else {
                    html += '<td class="text-danger"><i class="fa fa-times"></i> '+data[i].msg.debug+'</td>';
                }
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            $('#readings').html(html);
        });
    }

    updateReading();
    $.getJSON('/api/mqttclient/info',function(data) {
        $('#MQTT_URL').html(data.MQTT_URL);
    });
    setInterval(updateReading, 60000);
})