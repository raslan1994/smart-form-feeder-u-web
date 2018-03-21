/**
 * Created by raslanrauff on 3/15/18.
 */

window.onload = function() {
    var c = document.getElementById("layoutPreview");
    c.width = 600;
    c.height = 800;
    var ctx = c.getContext("2d");
    var img = document.getElementById("layoutImage");
    ctx.drawImage(img, 0, 0);

    getJSON('tmp/form_template_1.json',function (err, resp) {
       if(err == null){
           resp.forEach(function (field, index) {
               ctx.beginPath();
               ctx.rect(field.x,field.y,field.width,field.height);
               ctx.lineWidth = 2;
               ctx.strokeStyle = 'red';
               ctx.stroke();
           });
       }
    });
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};