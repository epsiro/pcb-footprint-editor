(function() {

var pads = new Array();
var zoom_level = 1;
var origin_x = 300;
var origin_y = 300;

$( "#zoom_slider" ).slider({
    orientation: "vertical",
    range: "min",
    min: 0.25,
    max: 2,
    step: 0.25,
    value: 1,
    slide: function( event, ui ) {
        zoom_level = ui.value;
        zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");
    }
});

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
  mode: "text/html",
  vimMode: true
});

editor.on("beforeChange", function (cm, change) {

    /* Only update pad if it has been changed by the code and not by the
     * graphical interface */
    for (var i = 0; i < pads.length; i++) {
        if(pads[i].pad.dragging == true) {
            return;
        }
    }

    var cursor = cm.getCursor();
    values = parse_pad_line(cm.getLine(cursor.line));

    console.log("values ", values);
});

editor.on("change", function(cm){

    /* Only update pad if it has been changed by the code and not by the
     * graphical interface */
    for (var i = 0; i < pads.length; i++) {
        if(pads[i].pad.dragging == true) {
            return;
        }
    }

    var lines = cm.getValue().split(/\r?\n/);

    for (var i = 0; i < lines.length; i++) {

        if (lines[i].match(/Pad/)) {

            values = parse_pad_line(lines[i]);

            pads[0].x1 = values.x1;
            pads[0].y1 = values.y1;
            pads[0].x2 = values.x2;
            pads[0].y2 = values.y2;
            pads[0].thickness = values.thickness;
            pads[0].draw();

        }
    }
});


var move_start = function() {

    /* Save some values we start with */
    this.ox = parseInt(this.attr('x'), 10);
    this.oy = parseInt(this.attr('y'), 10);
    this.ow = parseInt(this.attr('width'), 10);
    this.oh = parseInt(this.attr('height'), 10);

    this.dragging = true;
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
        var thickness = (this.attr('width')/100);

        var x1 = this.attr('x')/100 + thickness/2;
        var y1 = this.attr('y')/100 + thickness/2;
        var x2 = x1;
        var y2 = y1 + this.attr('height')/100 - thickness;

    } else {
        /* Laying down */
        var thickness = (this.attr('height')/100);

        var x1 = this.attr('x')/100 + thickness/2;
        var y1 = this.attr('y')/100 + thickness/2;

        var x2 = x1 + this.attr('width')/100 - thickness;
        var y2 = y1;
    }

    var element_header = 'Element["" "0805" "0805" "" 1000 1000 -1.5mm -2.5mm 0 100 ""]\n(\n';
    var pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm 0.6mm 1.2mm \"\" \"1\" \"square\"]", x1, y1, x2, y2, thickness);
    var element_end = '\n)';

    editor.setValue(element_header + pad_code + element_end);

    pads[0].pad_line_ref.attr({x1: x1*100});
    pads[0].pad_line_ref.attr({y1: y1*100});
    pads[0].pad_line_ref.attr({x2: x2*100});
    pads[0].pad_line_ref.attr({y2: y2*100});
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

function Pad(pad_number) {

    this.pad_number = pad_number;

    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.thickness = 0;

    this.pad = paper.rect(100, -100, 60, 60).attr({
        fill: "#8c96a0"
    });

    this.pad_line_ref = paper.line(0, 0, 0, 0).attr({
        stroke: "red",
        strokeWidth: 2
    });

    this.pad.mousemove(change_cursor);
    this.pad.drag(move_pad, move_start, move_end);

    this.pad_group = paper.group(this.pad, this.pad_line_ref);
    this.pad_group.attr({class: "pad"});
}

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
        console.log("Rotated pad is not supported.");
        return;
    }

    //console.log(x,y,height,width);

    if (height < 0 || width < 0) {
        console.log("Not valid pad.");
        return;
    }

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

var paper = Snap("#svg");

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
    pad_instance = new Pad(pads.length);
    zoom_group.add(pad_instance.pad_group);
    pads.push(pad_instance);
    //console.log(pads);
}

$(document).bind('keydown', 'p', add_pad);

})();
