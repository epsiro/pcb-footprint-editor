(function() {

var objects = new Array();
var zoom_level = 1;
var origin_x = 300;
var origin_y = 300;

$( "#load_file" ).on("click", load_file_as_text);
$( "#save_file" ).on("click", save_text_as_file);

$('#vim_mode_cb').click(function () {
    editor.setOption("vimMode", this.checked);
});

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

    pad_line = line.substring(line.indexOf('[') + 1).split(' ');

    //console.log(pad_line);

    var x1 = pad_line[0].slice(0, -2)*100;
    var y1 = pad_line[1].slice(0, -2)*100;
    var x2 = pad_line[2].slice(0, -2)*100;
    var y2 = pad_line[3].slice(0, -2)*100;
    var thickness = pad_line[4].slice(0, -2)*100;

    return {x1:x1, y1:y1, x2:x2, y2:y2, thickness:thickness}

}

var editor = CodeMirror.fromTextArea(document.getElementById("footprint_code"), {
  lineNumbers: false,
  mode: "text/html"
});

editor.on("change", function(cm, change){

    /* Only update pad if it has been changed by the code and not by the
     * graphical interface */
    for (var i = 2; i < objects.length; i++) {
        if(objects[i].pad.dragging == true) {
            return;
        }
    }

    if (change.to.line == change.from.line) {
        var changed_line = editor.getLine(change.to.line);

        if (changed_line.match(/Pad/)) {

            values = parse_pad_line(changed_line);

            if (objects.length >= change.to.line + 1 &&
                objects[change.to.line].line_number == change.to.line) {

                objects[change.to.line].x1 = values.x1;
                objects[change.to.line].y1 = values.y1;
                objects[change.to.line].x2 = values.x2;
                objects[change.to.line].y2 = values.y2;
                objects[change.to.line].thickness = values.thickness;
                objects[change.to.line].draw();
            }
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
            objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "none" });
        }

        // Show new selected
        hl_line = editor.addLineClass(editor.getCursor().line, "background", "selected_pad");
        objects[editor.getCursor().line].pad.attr({ stroke: "#445" });
    }
});

editor.on("blur", function(cm){

    // Remove old selected
    editor.removeLineClass(hl_line, "background", "selected_pad");

    if (hl_line.text.match(/Pad/)) {
        objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "none" });
    }
});

function Pad(pad_number, line_number) {

    this.pad_number = pad_number;
    this.line_number = line_number;


    var parentThis = this;

    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.thickness = 0.6;

    this.pad = paper.rect(-30, -30, 60, 60).attr({
        fill: "#8c96a0",
        strokeWidth: 2
    });

    this.pad_line_ref = paper.line(0, 0, 0, 0).attr({
        stroke: "red",
        strokeWidth: 2
    });

    pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm 0.6mm 1.2mm \"\" \"1\" \"square\"]\n", this.x1, this.y1, this.x2, this.y2, this.thickness);
    editor.replaceRange(pad_code, {line: this.line_number, ch: 0});

    var move_start = function() {

        /* Save some values we start with */
        this.ox = parseInt(this.attr('x'), 10);
        this.oy = parseInt(this.attr('y'), 10);
        this.ow = parseInt(this.attr('width'), 10);
        this.oh = parseInt(this.attr('height'), 10);

        this.dragging = true;

        highlight_pad();
    };

    var move_pad = function(dx, dy, posx, posy) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.attr('cursor')) {

            case 'sw-resize':
                this.attr({
                    x:      this.ox + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.oy - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.ow - Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.oh + Snap.snapTo(grid, dy/zoom_level, 30)
                });
                break;

            case 'se-resize':
                this.attr({
                    y:      this.oy - Snap.snapTo(grid, dy/zoom_level, 30),
                    width:  this.ow + Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.oh + Snap.snapTo(grid, dy/zoom_level, 30)
                });
                break;

            case 'ne-resize':
                this.attr({
                    width:  this.ow + Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.oh - Snap.snapTo(grid, dy/zoom_level, 30)
                });
                break;

            case 'nw-resize':
                this.attr({
                    x:      this.ox + Snap.snapTo(grid, dx/zoom_level, 30),
                    width:  this.ow - Snap.snapTo(grid, dx/zoom_level, 30),
                    height: this.oh - Snap.snapTo(grid, dy/zoom_level, 30)
                });
                break;

            default :
                this.attr({
                    x:      this.ox + Snap.snapTo(grid, dx/zoom_level, 30),
                    y:      this.oy - Snap.snapTo(grid, dy/zoom_level, 30)
                });
                break;
        }

        if (parseInt(this.attr('width'), 10) < parseInt(this.attr('height'), 10)) {
            parentThis.thickness = (parseInt(this.attr('width'),10)/100);

            parentThis.x1 = parseInt(this.attr('x'),10)/100 + parentThis.thickness/2;
            parentThis.y1 = parseInt(this.attr('y'),10)/100 + parentThis.thickness/2;
            parentThis.x2 = parentThis.x1;
            parentThis.y2 = parentThis.y1 + parseInt(this.attr('height'),10)/100 - parentThis.thickness;

        } else {
            /* Laying down */
            parentThis.thickness = (parseInt(this.attr('height'),10)/100);

            parentThis.x1 = parseInt(this.attr('x'),10)/100 + parentThis.thickness/2;
            parentThis.y1 = parseInt(this.attr('y'),10)/100 + parentThis.thickness/2;
            parentThis.x2 = parentThis.x1 + parseInt(this.attr('width'),10)/100 - parentThis.thickness;
            parentThis.y2 = parentThis.y1;
        }

        parentThis.pad_line_ref.attr({x1: parentThis.x1*100});
        parentThis.pad_line_ref.attr({y1: parentThis.y1*100});
        parentThis.pad_line_ref.attr({x2: parentThis.x2*100});
        parentThis.pad_line_ref.attr({y2: parentThis.y2*100});

        update_editor();

        editor.removeLineClass(parentThis.line_number, "background", "error_pad");
    };

    var move_end = function() {
        this.dragging = false;
    };

    var change_cursor = function(e, mouse_x, mouse_y) {

        /* Don't change cursor during a drag operation */
        if (this.dragging === true) {
            return;
        }

        /* X,Y Coordinates relative to shape's orgin */
        var relative_x =  mouse_x - $('#svg').offset().left - this.attr('x')*zoom_level - origin_x;
        var relative_y = -mouse_y - $('#svg').offset().top  - this.attr('y')*zoom_level + origin_y;

        var shape_width = this.attr('width')*zoom_level;
        var shape_height = this.attr('height')*zoom_level;

        var resize_border = 10;

        /* Change cursor */
        if (       relative_x <               resize_border && relative_y <                resize_border) {
            this.attr('cursor', 'sw-resize');

        } else if (relative_x > shape_width - resize_border && relative_y <                resize_border) {
            this.attr('cursor', 'se-resize');

        } else if (relative_x > shape_width - resize_border && relative_y > shape_height - resize_border) {
            this.attr('cursor', 'ne-resize');

        } else if (relative_x <               resize_border && relative_y > shape_height - resize_border) {
            this.attr('cursor', 'nw-resize');

        } else {
            this.attr('cursor', 'move');
        }
    };

    var highlight_pad = function(e) {
        parentThis.pad.attr({
            stroke: "#445"
        });
        editor.addLineClass(parentThis.line_number, "background", "selected_pad");
    };

    var unhighlight_pad = function(e) {
        if (this.dragging != true) {
            parentThis.pad.attr({
                stroke: "none"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
        }
    };

    this.pad.mousemove(change_cursor);
    this.pad.drag(move_pad, move_start, move_end);
    this.pad.hover(highlight_pad, unhighlight_pad);

    this.pad_group = paper.group(this.pad, this.pad_line_ref);
    this.pad_group.attr({class: "pad"});


    function update_editor() {
        pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm 0.6mm 1.2mm \"\" \"1\" \"square\"]", parentThis.x1, parentThis.y1, parentThis.x2, parentThis.y2, parentThis.thickness);
        editor.replaceRange(pad_code, {line: parentThis.line_number, ch: 0}, {line: parentThis.line_number, ch: editor.getLine(parentThis.line_number).length});
    };

    Pad.prototype.draw = function() {
        var x1 = this.x1;
        var y1 = this.y1;
        var x2 = this.x2;
        var y2 = this.y2;
        var thickness = this.thickness;

        var line_length = Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
        var angle = Math.atan2( (y2 - y1), (x2 - x1) ) * (180/Math.PI);

        //console.log(line_length, angle);

        if (angle == 0) {
            var x = x1 - thickness/2;
            var y = y1 - thickness/2;
            var width = line_length + thickness;
            var height = thickness;
        } else if (angle == -90) {
            var x = x2 - thickness/2;
            var y = y2 - thickness/2;
            var width = thickness;
            var height = line_length + thickness;
        } else if (angle == 90) {
            var x = x1 - thickness/2;
            var y = y1 - thickness/2;
            var width = thickness;
            var height = line_length + thickness;
        } else if (angle == 180) {
            var x = x2 - thickness/2;
            var y = y2 - thickness/2;
            var width = line_length + thickness;
            var height = thickness;
        } else {
            console.log(editor, parentThis.line_number);
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
            editor.addLineClass(parentThis.line_number, "background", "error_pad");
            console.log("Rotated pad is not supported.");
            return;
        }

        //console.log(x,y,height,width);

        if (height < 0 || width < 0) {
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
            editor.addLineClass(parentThis.line_number, "background", "error_pad");
            console.log("Not valid pad.");
            return;
        }

        editor.removeLineClass(parentThis.line_number, "background", "error_pad");

        this.pad.attr({x: x});
        this.pad.attr({y: y});
        this.pad.attr({height: height});
        this.pad.attr({width: width});

        this.pad_line_ref.attr({x1: x1});
        this.pad_line_ref.attr({y1: y1});
        this.pad_line_ref.attr({x2: x2});
        this.pad_line_ref.attr({y2: y2});

        console.log("Pad updated with attributes " + this.pad.attr());
    };

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

var center = paper.circle(0, 0, 10).attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 2
});

var zoom_group = paper.group(grid_small, grid_big, center);
zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");


var add_pad = function() {
    pad_instance = new Pad(objects.length, objects.length);
    zoom_group.add(pad_instance.pad_group);
    objects.push(pad_instance);
    //console.log(objects);
}

$(document).bind('keydown', 'p', add_pad);

var element_header = 'Element["" "0805" "0805" "" 1000 1000 -1.5mm -2.5mm 0 100 ""]\n(\n';
var element_end = ')';
editor.setValue(element_header + element_end);

objects.push("placeholder");
objects.push("placeholder");

})();
