(function() {

var objects = new Array();
var zoom_level = 1;
var origin_x = 300;
var origin_y = 300;

var global_dragging = false;
var global_first_endpoint = false;
var global_second_endpoint = false;
var global_first_endpoint_object = null;
var global_second_endpoint_object = null;

var anchor_size = 5;

// https://api.github.com/repos/Lindem-Data-Acquisition-AS/gedalib/git/trees/4a7f27695351fa8a9d97f7b2edc189b4340885d0

$( "#load_file" ).on("click", load_file_as_text);
$( "#save_file" ).on("click", save_text_as_file);

$('#vim_mode_cb').click(function () {
    editor.setOption("vimMode", this.checked);
});

function nm_to_view(number) {
    return number*100000000
}

function view_to_nm(number) {
    return number/100000000
}

function nm_to_mm(number) {
    return number*1000000
}

function mm_to_nm(number) {
    return number/1000000
}

function save_text_as_file() {

    var text_to_write = editor.getValue();
    var text_file_as_blob = new Blob([text_to_write], {type:'text/plain'});
    var file_name = "component.fp";

    var download_link = document.createElement("a");
    download_link.download = file_name;
    download_link.innerHTML = "Download File";

    if (window.webkitURL != null) {

        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        download_link.href = window.webkitURL.createObjectURL(text_file_as_blob);

    } else {

        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        download_link.href = window.URL.createObjectURL(text_file_as_blob);
        download_link.onclick = destroy_clicked_element;
        download_link.style.display = "none";
        document.body.appendChild(download_link);
    }

    download_link.click();
}

function destroy_clicked_element(event) {
    document.body.removeChild(event.target);
}

function load_file_as_text() {

    var file_to_load = document.getElementById("file_to_load").files[0];

    var file_reader = new FileReader();
    file_reader.onload = function(event) {
        editor.setValue(event.target.result);
    };

    file_reader.readAsText(file_to_load, "UTF-8");
}

function parse_pad_line(line) {
    if ( ! line.match(/Pad/)) {
        throw new UserException("InvalidFormat");
    }

    pad_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    //console.log(pad_line);

    var x1 = pad_line[0].slice(0, -2);
    var y1 = pad_line[1].slice(0, -2);
    var x2 = pad_line[2].slice(0, -2);
    var y2 = pad_line[3].slice(0, -2);
    var thickness = pad_line[4].slice(0, -2);

    return {x1:x1, y1:y1, x2:x2, y2:y2, thickness:thickness}

}

var editor = CodeMirror.fromTextArea(document.getElementById("footprint_code"), {
  lineNumbers: false,
  undoDepth: 10000,
  mode: "text/html"
});

function add_new_object(line) {

    var changed_line = editor.getLine(line);

    if (changed_line.match(/Pad/)) {
        values = parse_pad_line(changed_line);
        pad_instance = new Pad(line, line,
                mm_to_nm(values.x1),
                mm_to_nm(values.y1),
                mm_to_nm(values.x2),
                mm_to_nm(values.y2),
                mm_to_nm(values.thickness)
                );

        console.log("Pad added: ", pad_instance);
        pad_instance.draw();
        zoom_group.add(pad_instance.pad_group);
        objects.push(pad_instance);
    }
}

function remove_object(line) {

    var changed_line = editor.getLine(line);

    console.log(objects);
    console.log(line);
    pad_instance = objects[line];
    console.log("Pad removed: ", pad_instance);
    //pad_instance.kill();
    pad_instance.pad_group.remove();
    objects.splice(line,1);
}

editor.on("change", function(cm, change){

    console.log(change);

    /* Line added */
    if (change.removed[0] === "") {
        var line = change.to.line;
        add_new_object(line);

    /* Line removed */
    } else if (change.text[0] === "") {
        var line = change.from.line;
        remove_object(line);

    } else if (change.to.line == change.from.line) {
        var line = change.to.line;
        var changed_line = editor.getLine(change.to.line);

        if (changed_line.match(/Pad/)) {

            values = parse_pad_line(changed_line);

            if (objects.length >= change.to.line + 1 &&
                objects[change.to.line].line_number == change.to.line) {

                objects[change.to.line].x1 = mm_to_nm(values.x1);
                objects[change.to.line].y1 = mm_to_nm(values.y1);
                objects[change.to.line].x2 = mm_to_nm(values.x2);
                objects[change.to.line].y2 = mm_to_nm(values.y2);
                objects[change.to.line].thickness = mm_to_nm(values.thickness);
                objects[change.to.line].draw();
            }
        }
    } else {

        for (line = change.from.line; line < change.text.length; line++) {

            add_new_object(line);
        }
    }
});

var hl_line = editor.addLineClass(0, "background", "selected_pad");
editor.removeLineClass(0, "background", "selected_pad");

editor.on("cursorActivity", function(cm){

    if (editor.getLine(editor.getCursor().line).match(/Pad/)) {

        // Remove old selected
        editor.removeLineClass(hl_line, "background", "selected_pad");

        if (hl_line.text.match(/Pad/)) {
            objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "#8c96a0" });
        }

        // Show new selected
        hl_line = editor.addLineClass(editor.getCursor().line, "background", "selected_pad");
        objects[editor.getCursor().line].pad.attr({ stroke: "#acb6c0" });
    }
});

editor.on("blur", function(cm){

    // Remove old selected
    editor.removeLineClass(hl_line, "background", "selected_pad");

    if (hl_line.text.match(/Pad/)) {
        objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "#8c96a0" });
    }
});

function ElementLine(x1, y1, x2, y2, thickness) {


    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.thickness = thickness;

    this.line = paper.line(0, 0, 0, 0).attr({
        stroke: "black",
        strokeWidth: this.thickness
    });

    this.anchor_c  = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_e1 = paper.circle(0, 0, anchor_size).addClass("anchor_e1");
    this.anchor_e2 = paper.circle(0, 0, anchor_size).addClass("anchor_e2");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_e1,
        this.anchor_e2
    ).attr({
        fill: "red",
        stroke: "#445",
        strokeWidth: 2
    });
        //visibility: "hidden"

    this.update_anchors();

    this.elementline_group = paper.group(this.line, this.anchors);
    //this.pad_group.hover(highlight_pad, unhighlight_pad);
    this.elementline_group.attr({class: "elementline"});

    this.draw();

}

ElementLine.prototype.update_anchors = function() {

    this.anchor_c.attr( { cx: nm_to_view((this.x2-this.x1)/2), cy:nm_to_view((this.y2-this.y1)/2)});
    this.anchor_e1.attr({ cx:             nm_to_view(this.x1), cy:            nm_to_view(this.y1)});
    this.anchor_e2.attr({ cx:             nm_to_view(this.x2), cy:            nm_to_view(this.y2)});
};

ElementLine.prototype.draw = function() {
    this.line.attr({x1: nm_to_view(this.x1), y1: nm_to_view(this.y1), x2: nm_to_view(this.x2), y2: nm_to_view(this.y2)});
}




function Pad(pad_number, line_number, x1, y1, x2, y2, thickness) {

    this.pad_number = pad_number;
    this.line_number = line_number;

    var parentThis = this;

    /* all units in nm */
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.thickness = thickness;

    var pad_size = this.get_pad_size();

    this.anchor_c  = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_n  = paper.circle(0, 0, anchor_size).addClass("anchor_n");
    this.anchor_e  = paper.circle(0, 0, anchor_size).addClass("anchor_e");
    this.anchor_s  = paper.circle(0, 0, anchor_size).addClass("anchor_s");
    this.anchor_w  = paper.circle(0, 0, anchor_size).addClass("anchor_w");
    this.anchor_ne = paper.circle(0, 0, anchor_size).addClass("anchor_ne");
    this.anchor_nw = paper.circle(0, 0, anchor_size).addClass("anchor_nw");
    this.anchor_se = paper.circle(0, 0, anchor_size).addClass("anchor_se");
    this.anchor_sw = paper.circle(0, 0, anchor_size).addClass("anchor_sw");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_n,
        this.anchor_e,
        this.anchor_s,
        this.anchor_w,
        this.anchor_ne,
        this.anchor_nw,
        this.anchor_se,
        this.anchor_sw
    ).attr({
        fill: "white",
        stroke: "#445",
        strokeWidth: 2,
        visibility: "hidden"
    });

    this.update_anchors();

    this.pad = paper.line(nm_to_view(this.x1), nm_to_view(this.y1), nm_to_view(this.x2), nm_to_view(this.y2)).attr({
        stroke: "#8c96a0",
        strokeWidth: nm_to_view(this.thickness),
        strokeLinecap: "square"
    });

    this.pad_line_ref = paper.line(0, 0, 0, 0).attr({
        stroke: "red",
        strokeWidth: 2
    });

    var click_anchor = function() {

        var pad_size = parentThis.get_pad_size();

        if (this.attr("endpoint") != "true" && parentThis.endpoint != true) {

            if (global_first_endpoint != true) {

                parentThis.endpoint = true;
                parentThis.endpoint_nr = 1;
                parentThis.endpoint_anchor = this;
                global_first_endpoint = true;
                global_first_endpoint_object = parentThis;

                this.attr({
                    visibility: "visible",
                    endpoint: "true",
                    stroke: "red"
                });

                parentThis.update_distance_marker();

            } else if (global_second_endpoint != true) {

                parentThis.endpoint = true;
                parentThis.endpoint_nr = 2;
                parentThis.endpoint_anchor = this;
                global_second_endpoint = true;
                global_second_endpoint_object = parentThis;

                this.attr({
                    visibility: "visible",
                    endpoint: "true",
                    stroke: "blue"
                });

                parentThis.update_distance_marker();

            }

        } else if (this.attr("endpoint") == "true") {

            if (parentThis.endpoint_nr == 1) {
                parentThis.endpoint_nr = 0;
                global_first_endpoint = false;
                global_first_endpoint_object = null;
            }

            if (parentThis.endpoint_nr == 2) {
                parentThis.endpoint_nr = 0;
                global_second_endpoint = false;
                global_second_endpoint_object = null;
            }

            parentThis.endpoint_anchor = null;
            parentThis.endpoint = false;

            this.attr({
                visibility: "",
                endpoint: "false",
                stroke: "#445"
            });
        }

        if (global_first_endpoint == true && global_second_endpoint == true) {
            distance_x.attr({ visibility: "visible" });
            distance_y.attr({ visibility: "visible" });
        } else {
            distance_x.attr({ visibility: "hidden" });
            distance_y.attr({ visibility: "hidden" });
        }

    }

    var drag_anchor_start = function() {

        this.pad_size_original = parentThis.get_pad_size();

        global_dragging = true;

        highlight_pad();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.node.classList[0]) {

            case 'anchor_n':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height - Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            case 'anchor_e':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  + Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height
                }
                break;

            case 'anchor_s':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y      - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height + Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            case 'anchor_w':
                var pad_size = {
                    x:      this.pad_size_original.x      + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  - Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height
                }
                break;

            case 'anchor_sw':
                //this.attr('cursor', 'sw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x      + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.pad_size_original.y      - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.pad_size_original.width  - Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height + Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            case 'anchor_se':
                //this.attr('cursor', 'sw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y      - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.pad_size_original.width  + Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height + Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            case 'anchor_ne':
                //this.attr('cursor', 'ne-resize');
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  + Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height - Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            case 'anchor_nw':
                //this.attr('cursor', 'nw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x      + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  - Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.pad_size_original.height - Snap.snapTo(grid, dy/zoom_level, 30)
                }
                break;

            default :
                //this.attr('cursor', 'move');
                var pad_size = {
                    x:      this.pad_size_original.x      + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.pad_size_original.y      - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height
                }
                break;
        }

        parentThis.set_pad_size(pad_size);

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
    };

    var highlight_pad = function(e) {
        parentThis.pad.attr({
            stroke: "#acb6c0"
        });

        parentThis.anchors.attr({
            visibility: "visible"
        });
        editor.addLineClass(parentThis.line_number, "background", "selected_pad");
    };

    var unhighlight_pad = function(e) {
        if (global_dragging != true) {
            parentThis.pad.attr({
                stroke: "#8c96a0"
            });
            parentThis.anchors.attr({
                visibility: "hidden"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
        }
    };

    this.anchor_c.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_n.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_e.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_s.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_w.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_ne.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_nw.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_se.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_sw.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.pad.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.anchor_c.click(click_anchor);
    this.anchor_n.click(click_anchor);
    this.anchor_e.click(click_anchor);
    this.anchor_s.click(click_anchor);
    this.anchor_w.click(click_anchor);
    this.anchor_ne.click(click_anchor);
    this.anchor_nw.click(click_anchor);
    this.anchor_se.click(click_anchor);
    this.anchor_sw.click(click_anchor);

    this.pad_group = paper.group(this.pad, this.pad_line_ref, this.anchors);
    this.pad_group.hover(highlight_pad, unhighlight_pad);
    this.pad_group.attr({class: "pad"});


}

Pad.prototype.set_pad_size = function(pad_size) {

        if (pad_size.width < pad_size.height) {
            /* portrait */
            this.thickness = view_to_nm(pad_size.width);

            this.x1 = view_to_nm(pad_size.x) + this.thickness/2;
            this.y1 = view_to_nm(pad_size.y) + this.thickness/2;
            this.x2 = this.x1;
            this.y2 = this.y1 + view_to_nm(pad_size.height) - this.thickness;

        } else {
            /* landscape */
            this.thickness = view_to_nm(pad_size.height);

            this.x1 = view_to_nm(pad_size.x) + this.thickness/2;
            this.y1 = view_to_nm(pad_size.y) + this.thickness/2;
            this.x2 = this.x1 + view_to_nm(pad_size.width) - this.thickness;
            this.y2 = this.y1;
        }
}

Pad.prototype.get_pad_size = function() {

    var x1 = this.x1;
    var y1 = this.y1;
    var x2 = this.x2;
    var y2 = this.y2;
    var thickness = this.thickness;

    if (x1 == x2) {
        /* portrait */
        var line_length = y2 - y1;

        var x = x1 - thickness/2;
        var y = y1 - thickness/2;
        var width = thickness;
        var height = line_length + thickness;

    } else if (y1 == y2) {
        /* landscape */
        var line_length = x2 - x1;

        var x = x1 - thickness/2;
        var y = y1 - thickness/2;
        var width = line_length + thickness;
        var height = thickness;

    } else {
        return null;
    }

    return {x:nm_to_view(x), y:nm_to_view(y), width:nm_to_view(width), height:nm_to_view(height)}
}

Pad.prototype.draw = function() {

    pad_size = this.get_pad_size();

    if (pad_size == null) {

        //console.log(editor, parentThis.line_number);
        editor.removeLineClass(this.line_number, "background", "selected_pad");
        editor.addLineClass(this.line_number, "background", "error_pad");
        console.log("Rotated pad is not supported.");
        return;
    }


    if (pad_size.height < 0 || pad_size.width < 0) {
        editor.removeLineClass(this.line_number, "background", "selected_pad");
        editor.addLineClass(this.line_number, "background", "error_pad");
        console.log("Not valid pad.");
        return;
    }

    editor.removeLineClass(this.line_number, "background", "error_pad");

    this.pad.attr({x1: nm_to_view(this.x1), y1: nm_to_view(this.y1), x2: nm_to_view(this.x2), y2: nm_to_view(this.y2), strokeWidth: nm_to_view(this.thickness) });

    this.pad_line_ref.attr({x1: nm_to_view(this.x1)});
    this.pad_line_ref.attr({y1: nm_to_view(this.y1)});
    this.pad_line_ref.attr({x2: nm_to_view(this.x2)});
    this.pad_line_ref.attr({y2: nm_to_view(this.y2)});

    this.update_anchors();
    this.update_distance_marker();

    console.log("Pad updated with attributes " + this.pad.attr());
};


Pad.prototype.update_editor = function() {
        pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm 0.6mm 1.2mm \"\" \"1\" \"square\"]",
                nm_to_mm(this.x1),
                nm_to_mm(this.y1),
                nm_to_mm(this.x2),
                nm_to_mm(this.y2),
                nm_to_mm(this.thickness));
        editor.replaceRange(pad_code, {line: this.line_number, ch: 0}, {line: this.line_number, ch: editor.getLine(this.line_number).length});
}


Pad.prototype.update_anchors = function() {

    pad_size = this.get_pad_size();

    this.anchor_c.attr({ cx:                 0, cy:                  0});
    this.anchor_n.attr({ cx:                 0, cy:  pad_size.height/2});
    this.anchor_e.attr({ cx:  pad_size.width/2, cy:                  0});
    this.anchor_s.attr({ cx:                 0, cy: -pad_size.height/2});
    this.anchor_w.attr({ cx: -pad_size.width/2, cy:                  0});
    this.anchor_ne.attr({cx:  pad_size.width/2, cy:  pad_size.height/2});
    this.anchor_nw.attr({cx: -pad_size.width/2, cy:  pad_size.height/2});
    this.anchor_se.attr({cx:  pad_size.width/2, cy: -pad_size.height/2});
    this.anchor_sw.attr({cx: -pad_size.width/2, cy: -pad_size.height/2});

    this.anchors.transform("translate(" + (pad_size.x + pad_size.width/2) + "," + (pad_size.y + pad_size.height/2) + ")");
};

Pad.prototype.update_distance_marker = function() {

    if (global_first_endpoint_object == this) {

        var pad_size = this.get_pad_size();
        distance_x_line.attr({
            x1: (parseInt(this.endpoint_anchor.attr("cx"),10) + pad_size.x + pad_size.width/2),
            y1: (parseInt(this.endpoint_anchor.attr("cy"),10) + pad_size.y + pad_size.height/2),
            y2: (parseInt(this.endpoint_anchor.attr("cy"),10) + pad_size.y + pad_size.height/2)
        });
        distance_y_line.attr({
            y1: (parseInt(this.endpoint_anchor.attr("cy"),10) + pad_size.y + pad_size.height/2)
        });

        var distance_x_value = Math.round(distance_x_line.attr("x2") - distance_x_line.attr("x1"));
        var distance_y_value = Math.round(distance_y_line.attr("y2") - distance_y_line.attr("y1"));

        distance_x_text.attr({x: +distance_x_line.attr("x1") + distance_x_value/2, y: -distance_x_line.attr("y1") - 10, text: distance_x_value/100 + "mm"})
        distance_y_text.attr({x: +distance_y_line.attr("x1") + 10, y: -distance_y_line.attr("y1") - distance_y_value/2, text: distance_y_value/100 + "mm"})
    }

    if (global_second_endpoint_object == this) {

        var pad_size = this.get_pad_size();
        distance_x_line.attr({
            x2: (parseInt(this.endpoint_anchor.attr("cx"),10) + pad_size.x + pad_size.width/2)
        });
        distance_y_line.attr({
            x1: (parseInt(this.endpoint_anchor.attr("cx"),10) + pad_size.x + pad_size.width/2),
            x2: (parseInt(this.endpoint_anchor.attr("cx"),10) + pad_size.x + pad_size.width/2),
            y2: (parseInt(this.endpoint_anchor.attr("cy"),10) + pad_size.y + pad_size.height/2)
        });

        var distance_x_value = Math.round(distance_x_line.attr("x2") - distance_x_line.attr("x1"));
        var distance_y_value = Math.round(distance_y_line.attr("y2") - distance_y_line.attr("y1"));

        distance_x_text.attr({x: +distance_x_line.attr("x1") + distance_x_value/2, y: -distance_x_line.attr("y1") - 10, text: distance_x_value/100 + "mm"})
        distance_y_text.attr({x: +distance_y_line.attr("x1") + 10, y: -distance_y_line.attr("y1") - distance_y_value/2, text: distance_y_value/100 + "mm"})
    }

};

Pad.prototype.kill = function() {
    //zoom_group.remove();
    //this.pad
    //this.pad_line_ref
    //this.anchor_c
    //this.anchor_n
    //this.anchor_e
    //this.anchor_s
    //this.anchor_w
    //this.anchor_ne
    //this.anchor_nw
    //this.anchor_se
    //this.anchor_sw
    //this.anchors
    //this.pad_group
}



var paper = Snap("#svg");

paper.node.addEventListener("mousewheel", mouse_wheel_handler, false);

function mouse_wheel_handler (ev) {
    ev.preventDefault();

    if (ev.wheelDelta > 0) {
        if (zoom_level < 3) {
            zoom_level += 0.25;
        }
    } else {
        if (zoom_level > 0.25) {
            zoom_level -= 0.25;
        }
    }


    //origin_x = 300 - 100*zoom_level;
    //origin_y = 300 - 100*zoom_level;

    //grid_coord_x =  (ev.clientX - 300)/zoom_level + -1*(origin_x - 300)/zoom_level;
    //grid_coord_y = -(ev.clientY - 300)/zoom_level - -1*(origin_y - 300)/zoom_level;

    //origin_x = 300 + (grid_coord_x)*zoom_level;
    //origin_y = 300 + (grid_coord_y)*zoom_level;

    zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");

}

var grid_pattern_small = paper.path("M 10 0 L 0 0 0 10").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 0.5
}).pattern(0, 0, 10, 10);

var grid_pattern_big = paper.path("M 100 0 L 0 0 0 100").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 1
}).pattern(0, 0, 100, 100);

var bg = paper.rect(-1500, -1500, 3000, 3000, 0, 0).attr({
    //fill: "#274f2a"
    fill: "#fefefe"
});

var grid_small = paper.rect(-1500, -1500, 3000, 3000, 0, 0).attr({
    fill: grid_pattern_small
});

var grid_big = paper.rect(-1500, -1500, 3000, 3000, 0, 0).attr({
    fill: grid_pattern_big
});

var begin_drag_workspace = function() {
    if (global_dragging == true) {
        return;
    }

    this.origin_x = origin_x;
    this.origin_y = origin_y;
};

var drag_workspace = function(dx, dy, posx, posy) {
    if (global_dragging == true) {
        return;
    }

    origin_x = this.origin_x + dx;
    origin_y = this.origin_y + dy;
    zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");
}

paper.drag(drag_workspace, begin_drag_workspace, null);
paper.drag(drag_workspace, begin_drag_workspace, null);

var arrow_start = paper.path("M0,3 L-10,0 L0,-3").attr({stroke: "#aaa", fill: "none"});
var arrow_end = paper.path("M0,3 L10,0 L0,-3").attr({stroke: "#aaa", fill: "none"});
var marker_start = arrow_start.marker(-10,-6, 20,12, -10,0);
var marker_end = arrow_end.marker(-10,-6, 20,12, 10,0);

var distance_x_line = paper.line(0, 0, 0, 0).attr({
    stroke: "#aaa",
    strokeWidth: 2,
    markerStart: marker_start,
    markerEnd: marker_end
});
var distance_x_text = paper.text(0, 0, "");
var distance_x = paper.group(distance_x_line, distance_x_text);
distance_x_text.transform("scale(1,-1)");
distance_x.attr({ visibility: "hidden" });

var distance_y_line = paper.line(0, 0, 0, 0).attr({
    stroke: "#aaa",
    strokeWidth: 2,
    markerStart: marker_start,
    markerEnd: marker_end
});
var distance_y_text = paper.text(0, 0, "");
var distance_y = paper.group(distance_y_line, distance_y_text);
distance_y_text.transform("scale(1,-1)");
distance_y.attr({ visibility: "hidden" });

var center = paper.circle(0, 0, 10).attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 2
});

var zoom_group = paper.group(grid_small, grid_big, center, distance_x, distance_y);
zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");

function get_last_line() {

    var last_line;

    editor.eachLine(function(line){
        if (line.text === ")") {
            last_line = editor.getLineNumber(line);
        }
    });

    return last_line;
}

var add_pad = function(e) {

    if (e.type == "dblclick") {
        var x1 = view_to_nm( (e.clientX - origin_x)/zoom_level );
        var y1 = view_to_nm(-(e.clientY - origin_y)/zoom_level );

        //x1 = Math.round(x1 * 10) / 10;
        //y1 = Math.round(y1 * 10) / 10;

    } else {
        var x1 = 0;
        var y1 = 0;
    }

    var x2 = x1;
    var y2 = y1;

    var thickness = mm_to_nm(0.6);

    pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm 0.6mm 1.2mm \"\" \"1\" \"square\"]\n",
            nm_to_mm(x1),
            nm_to_mm(y1),
            nm_to_mm(x2),
            nm_to_mm(y2),
            nm_to_mm(thickness));

    editor.replaceRange(pad_code, {line: get_last_line(), ch: 0});
}


$(document).bind('keydown', 'p', add_pad);
$( "#svg" ).dblclick(add_pad);

var element_header = 'Element["" "0805" "0805" "" 1000 1000 -1.5mm -2.5mm 0 100 ""]\n(\n';
var element_end = ')';
editor.setValue(element_header + element_end);
editor.clearHistory();

objects.push("placeholder");
objects.push("placeholder");

})();
