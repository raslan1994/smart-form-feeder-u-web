/**
 * Created by raslanrauff on 3/18/18.
 */

const PART_INPUT = 'ip';
const PART_RESULT = 'rp';
const PART_LOADER = 'lp';

function FormView(){
    var this_ = this;
    this.pages = [];
    this.formLayout = {};
    this.activeLayoutIndex = 0;
    this.layoutDisplay = null;
    this.activeThreshould = 168;
    this.currentPreviewCtx = null;
    this.uploadImgs = [];

    //Visual units
    this.loaderPart = null;
    this.inputPart = null;
    this.resultPart = null;

    this.activeResultSet = [];
    this.displayResult = function () {
        if(this_.activeResultSet == null) return;

        var fieldSet = this.activeResultSet.pages;
        if(fieldSet != null && fieldSet.length > 0){
            var resultHtmlBegining = '<div class="row">';
            resultHtmlBegining += '<form action="'+ this_.activeResultSet.requestURL +'" method="' + this.activeResultSet.requestMethod + '">';

            fieldSet.forEach(function (field,fieldIndex) {
                var fieldTemplateBegining = '<div class="form-group">';
                fieldTemplateBegining += '<label>' + field.field +'</label>';
                fieldTemplateBegining += '<input type="text" class="form-control" value="' + field.value +'"/>';
                var fieldTemplateEnd = '</div>';

                resultHtmlBegining += fieldTemplateBegining + fieldTemplateEnd;
            });

            var resultHtmlEnd = '<button class="btn btn-primary btn-sm" type="submit">Submit</button></form></div>';

            this_.resultPart.innerHTML = resultHtmlBegining + resultHtmlEnd;
        }

    },
    this.setPartVisibility = function(part,isVisible){
        var displayStyle = isVisible ? '' : 'none';
        switch (part){
            case PART_INPUT:
                this_.inputPart.style.display = displayStyle;
                break;
            case PART_RESULT:
                this_.resultPart.style.display = displayStyle;
                break;
            case PART_LOADER:
                this_.loaderPart.style.display = displayStyle;
                break;
            default:
                break;
        };
    },
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
        oReq.open("POST", HOST + FORM_INSERT_URL + '?li='+this_.activeLayoutIndex, true);
        oReq.onload = function(oEvent) {
            if (oReq.status == 200) {
                //set data set
                this_.activeResultSet = JSON.parse(oEvent.target.response);

                //preview results
                this_.displayResult();

                //hide loader
                this_.setPartVisibility(PART_LOADER,false);

                //display management
                this_.setPartVisibility(PART_RESULT, true);
                console.log(this_.activeResultSet);
            } else {
                this_.activeResultSet = null;
                console.error("Error " + oReq.status + " occurred when trying to upload your file.<br \/>");

                //show input part again
                this_.setPartVisibility(PART_INPUT,true);

                //hide loader
                this_.setPartVisibility(PART_LOADER,false);
            }

            //hide loader
            this_.setPartVisibility(PART_RESULT,true);
        };

        //disable input part
        this_.setPartVisibility(PART_INPUT,false);

        //dsiplay loader
        this_.setPartVisibility(PART_LOADER,true);

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
            applyThreshold(pixels,this_.activeThreshould);
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

        this_.activeLayoutIndex = index;

        //initialize units
        this_.loaderPart = document.getElementById('loaderPart');
        this_.resultPart = document.getElementById('resultPart');
        this_.inputPart = document.getElementById('inputPart');

        //show loader
        this_.setPartVisibility(PART_LOADER,true);

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

                //enable input part
                this_.setPartVisibility(PART_INPUT,true);
            }

            //hide loader
            this_.setPartVisibility(PART_LOADER,false);
        });
    };
}