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
