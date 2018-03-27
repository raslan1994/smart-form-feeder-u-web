/**
 * Created by raslanrauff on 3/18/18.
 */

function LayoutPreviewView() {
    var this_ = this;
    this.formLayoutGrid = null;
    this.formLayouts = [];
    this.init = function () {
        var url = HOST + FORM_LAYOUT_URL;

        //initialize DOMs
        this_.formLayoutGrid = document.getElementById("formLayoutGrid");

        getJSON(url,function (err, resp) {
            if(resp!= null){
                console.log(resp);
                var formTemplateHtmlBegin = '<ul class="templates-grid">';
                var formTemplateHtmlEnd = '</ul>';

                this_.formLayouts = [];
                resp.forEach(function (fl, index) {
                    this_.formLayouts[index] = fl;

                    var rowTemplateHtmlBegin = '<li>';
                    rowTemplateHtmlBegin += '<div class="card" style="width: 18rem;">';
                    rowTemplateHtmlBegin += '<div class="card-body">';
                    rowTemplateHtmlBegin += '<h5 class="card-title">' + fl.name + '</h5>';
                    rowTemplateHtmlBegin += '<p class="card-text">';
                    rowTemplateHtmlBegin += '<form>';

                    rowTemplateHtmlBegin += '<div class="form-group">';
                    rowTemplateHtmlBegin += '<span class="title">No of Pages: </span>';
                    rowTemplateHtmlBegin += '<span>' + fl.pages.length + '</span>';
                    rowTemplateHtmlBegin += '</div>';

                    rowTemplateHtmlBegin += '<div class="form-group">';
                    rowTemplateHtmlBegin += '<span class="title">Input Image (in px): </span>';
                    rowTemplateHtmlBegin += '</div>';

                    rowTemplateHtmlBegin += '<div class="form-group">';
                    rowTemplateHtmlBegin += '<span class="title">Width: </span>';
                    rowTemplateHtmlBegin += '<span>' + fl.imageWidth + 'px</span>';
                    rowTemplateHtmlBegin += '</div>';

                    rowTemplateHtmlBegin += '<div class="form-group">';
                    rowTemplateHtmlBegin += '<span class="title">Height: </span>';
                    rowTemplateHtmlBegin += '<span>' + fl.imageHeight + 'px</span>';
                    rowTemplateHtmlBegin += '</div>';

                    rowTemplateHtmlBegin += '</form>';
                    rowTemplateHtmlBegin += '<a href="form.html?li=' + index +'" class="btn btn-primary btn-sm">More Info</a>';
                    var rowTemplateHtmlEnd = '</div></div></li>';

                    formTemplateHtmlBegin += rowTemplateHtmlBegin + rowTemplateHtmlEnd;
                });

                this_.formLayoutGrid.innerHTML = formTemplateHtmlBegin + formTemplateHtmlEnd;
            }
        });
    };
}