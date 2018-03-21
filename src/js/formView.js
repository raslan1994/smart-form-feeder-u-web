/**
 * Created by raslanrauff on 3/18/18.
 */


function FormView(){
    var this_ = this;
    this.pages = [];
    this.formLayout = {};
    this.layoutDisplay = null;
    this.currentPreviewCtx = null;
    this.uploadImgs = [];
    this.loaderPart = null;
    this.setLoader=function (isVisible) {
        if(isVisible){
            this_.loaderPart.style.display = '';
        }else{
            this_.loaderPart.style.display = 'none';
        }
    },
    this.feedForm = function () {
        var fd = new FormData();
        this_.uploadImgs.forEach(function (img, index) {
            fd.append('file', img);
        });

        var oReq = new XMLHttpRequest();
        oReq.open("POST", HOST + FORM_INSERT_URL + '?li=0', true);
        oReq.onload = function(oEvent) {
            if (oReq.status == 200) {
                console.log(JSON.parse(oEvent.target.response));
            } else {
                console.log("Error " + oReq.status + " occurred when trying to upload your file.<br \/>");
            }

            //hide loader
            this_.setLoader(false);
        };

        //dsiplayloader
        this_.setLoader(true);

        //request
        oReq.send(fd);


    },
    this.highlightInputArea = function (field, ctx) {
        ctx.font = "20px Arial";
        ctx.fillStyle = field.color;
        ctx.fillText(field.field,(field.x + 10),(field.y + 30));

        ctx.beginPath();
        ctx.rect(field.x,field.y,field.width,field.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = field.color;
        ctx.stroke();
    };
    this.openPreview = function (e,index) {
        var canvas = document.getElementById('layoutPreviewCanvas');
        var ctx = canvas.getContext('2d');
        var url = URL.createObjectURL(e.files[0]);
        var img = new Image();
        var height = this_.formLayout.imageHeight;
        var width = this_.formLayout.imageWidth;
        img.onload = function() {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);

            var pixels = ctx.getImageData(0,0, width,height);
            applyThreshold(pixels,90);
            ctx.putImageData(pixels,0,0);

            var bwImg = dataURItoBlob(canvas.toDataURL());
            bwImg.lastModified = new Date().getTime();
            bwImg.name = e.files[0].name;

            //overide image
            var f= new File([bwImg],bwImg.name, {type:"image/png"});
            this_.uploadImgs[index] = f;

            //highlight input area after saving image
            var curPage = this_.pages[index];
            curPage.forEach(function (field, fieldIndex) {
                this_.highlightInputArea(field,ctx);
            });

            //setup model title
            document.getElementById('previewModalLabel').innerHTML = "Page " + (index+1);

            $('#previewModal').modal({});
        };
        img.src = url;
        console.log(e);
    },
    this.init = function () {
        var index = getParameterByName('li');
        var url = HOST + FORM_LAYOUT_URL + "?i=" + index;

        //show loader
        this_.loaderPart = document.getElementById('loaderPart');
        this_.setLoader(true);

        getJSON(url,function (err, resp) {
            this_.formLayout = resp;
            this_.pages = resp.pages;
            this_.layoutDisplay = document.getElementById('layoutPreview');

            //action="' + HOST + FORM_INSERT_URL + '?li=' + index + '"
            if(this_.pages.length > 0){
                var templateHtmlBegin = '<form method="post" enctype="multipart/form-data">';
                var templateHtmlEnd = '</form>';

                this_.pages.forEach(function (page, pageIndex) {
                    templateHtmlBegin += '<div class="form-group">';
                    templateHtmlBegin += '<h3>Page ' + (pageIndex+1) + ' </h3>';
                    templateHtmlBegin += '<input type="file" id="img_' + pageIndex +'" name="uploadImgs" class="form-control" accept="image/x-png,image/jpeg" onchange="view.openPreview(this,' + pageIndex+ ');"/>';
                    templateHtmlBegin += '</div>';
                });

                templateHtmlBegin += '<button class="btn btn-sm btn-primary" onclick="view.feedForm(); return false;">Confirm & Submit</button>'

                this_.layoutDisplay.innerHTML = templateHtmlBegin + templateHtmlEnd;
            }

            //hide loader
            this_.setLoader(false);
        });
    };
}