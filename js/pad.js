function Pad(line_number, x1, y1, x2, y2, thickness, clearance, mask_thickness, number) {

    this.number = number;
    this.line_number = line_number;

    var parentThis = this;

    this.selected = false;
    this.locked = false;

    /* all units in nm */
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.thickness = thickness;
    this.mask_margin = mask_thickness - thickness;
    this.clearance_margin = clearance;

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

    this.pad = paper.line(0, 0, 0, 0).attr({
        stroke: "#8c96a0",
        strokeWidth: 0,
        strokeLinecap: "square"
    });

    this.mask = paper.line(0, 0, 0, 0).attr({
        stroke: "black",
        strokeWidth: 0,
        strokeLinecap: "square"
    });

    this.clearance = paper.line(0, 0, 0, 0).attr({
        stroke: "black",
        strokeWidth: 0,
        strokeLinecap: "square"
    });

    this.pad_line_ref = paper.line(0, 0, 0, 0).attr({
        stroke: "red",
        strokeWidth: 2,
        visibility: "hidden"
    });

    this.show_number = paper.text(0, 0, "").attr({
        "font-size": 42,
        fill: "red",
        textAnchor: "middle",
        "alignment-baseline": "central",
        visibility: "visible"
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
            $("#status_xy_distance").show();
        } else {
            distance_x.attr({ visibility: "hidden" });
            distance_y.attr({ visibility: "hidden" });
            $("#status_xy_distance").hide();
        }

    }

    var drag_anchor_start = function() {

        this.pad_size_original = parentThis.get_pad_size();

        this.last_dx = 0;
        this.last_dy = 0;

        global_dragging = true;

        highlight_pad();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.node.classList[0]) {

            case 'anchor_s':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_e':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height
                }
                break;

            case 'anchor_n':
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y      + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30)),
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height - view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_w':
                var pad_size = {
                    x:      this.pad_size_original.x      + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  - view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height
                }
                break;

            case 'anchor_nw':
                //this.attr('cursor', 'sw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x      + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    y:      this.pad_size_original.y      + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30)),
                    width:  this.pad_size_original.width  - view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height - view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_ne':
                //this.attr('cursor', 'sw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y      + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30)),
                    width:  this.pad_size_original.width  + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height - view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_se':
                //this.attr('cursor', 'ne-resize');
                var pad_size = {
                    x:      this.pad_size_original.x,
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_sw':
                //this.attr('cursor', 'nw-resize');
                var pad_size = {
                    x:      this.pad_size_original.x      + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    y:      this.pad_size_original.y,
                    width:  this.pad_size_original.width  - view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    height: this.pad_size_original.height + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30))
                }
                break;

            case 'anchor_c':
                //this.attr('cursor', 'move');
                // FIXME get rid of this:
                var pad_size = {
                    x:      this.pad_size_original.x      + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)),
                    y:      this.pad_size_original.y      + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30)),
                    width:  this.pad_size_original.width,
                    height: this.pad_size_original.height
                }

               var dx = view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
               var dy = view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));

               if (parentThis.selected == false ) {
                   parentThis.move(dx - this.last_dx, dy - this.last_dy);
               }

               move_selected_objects(dx - this.last_dx, dy - this.last_dy);

               this.last_dx = dx;
               this.last_dy = dy;

                break;
        }

        parentThis.set_pad_size(pad_size);

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
    };

    var highlight_pad = function(e) {
        if (global_dragging != true && parentThis.locked === false) {

            //parentThis.selected = true;

            parentThis.pad.attr({
                stroke: "#acb6c0"
            });

            parentThis.anchors.attr({
                visibility: "visible"
            });
            editor.addLineClass(parentThis.line_number, "background", "selected_pad");

            $("#object_info").show().html(parentThis.get_info());
        }
    };

    var unhighlight_pad = function(e) {
        if (global_dragging != true) {

            //parentThis.selected = false;

            parentThis.pad.attr({
                stroke: "#8c96a0"
            });
            parentThis.anchors.attr({
                visibility: "hidden"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");

            $("#object_info").hide();
        }
    };

    var toggle_select = function (e) {

        if (parentThis.selected == true) {

            if (e.shiftKey == false) {
                deselect_all_objects();
            }

            parentThis.unselect();

        } else if (parentThis.selected == false) {

            if (e.shiftKey == false) {
                deselect_all_objects();
            }

            parentThis.select();
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
    //this.pad.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.anchor_c.click(click_anchor);
    this.anchor_n.click(click_anchor);
    this.anchor_e.click(click_anchor);
    this.anchor_s.click(click_anchor);
    this.anchor_w.click(click_anchor);
    this.anchor_ne.click(click_anchor);
    this.anchor_nw.click(click_anchor);
    this.anchor_se.click(click_anchor);
    this.anchor_sw.click(click_anchor);

    this.graphical_group = paper.group(this.pad, this.clearance, this.mask, this.pad_line_ref, this.show_number, this.anchors);
    this.graphical_group.hover(highlight_pad, unhighlight_pad);
    this.graphical_group.click(toggle_select);
    this.graphical_group.attr({class: "pad"});

}

Pad.prototype.set_pad_size = function(pad_size) {

        if (pad_size.width < pad_size.height) {
            /* portrait */
            this.thickness = pad_size.width;

            this.x1 = pad_size.x + this.thickness/2;
            this.y1 = pad_size.y + this.thickness/2;
            this.x2 = this.x1;
            this.y2 = this.y1 + pad_size.height - this.thickness;

        } else {
            /* landscape */
            this.thickness = pad_size.height;

            this.x1 = pad_size.x + this.thickness/2;
            this.y1 = pad_size.y + this.thickness/2;
            this.x2 = this.x1 + pad_size.width - this.thickness;
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
        var line_length = Math.abs(y2 - y1);

        var x = x1 - thickness/2;
        if (y2 - y1 < 0) {
            var y = y1 - thickness/2 - line_length;
        } else {
            var y = y1 - thickness/2;
        }
        var width = thickness;
        var height = line_length + thickness;

    } else if (y1 == y2) {
        /* landscape */
        var line_length = Math.abs(x2 - x1);

        if (x2 - x1 < 0) {
            var x = x1 - thickness/2 - line_length;
        } else {
            var x = x1 - thickness/2;
        }
        var y = y1 - thickness/2;
        var width = line_length + thickness;
        var height = thickness;

    } else {
        return null;
    }

    return {x:x, y:y, width:width, height:height}
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

    this.pad.attr({
        x1: nm_to_view(this.x1),
        y1: nm_to_view(this.y1),
        x2: nm_to_view(this.x2),
        y2: nm_to_view(this.y2),
        strokeWidth: nm_to_view(this.thickness)
    });

    this.mask.attr({
        x1: nm_to_view(this.x1),
        y1: nm_to_view(this.y1),
        x2: nm_to_view(this.x2),
        y2: nm_to_view(this.y2),
        strokeWidth: nm_to_view(this.thickness + this.mask_margin)
    });

    this.clearance.attr({
        x1: nm_to_view(this.x1),
        y1: nm_to_view(this.y1),
        x2: nm_to_view(this.x2),
        y2: nm_to_view(this.y2),
        strokeWidth: nm_to_view(this.thickness + this.clearance_margin)
    });

    this.show_number.attr({
        x: nm_to_view(this.x1 + (this.x2 - this.x1)/2),
        y: nm_to_view(this.y1 + (this.y2 - this.y1)/2),
        text: this.number
    });

    //console.log(this.mask);

    this.pad_line_ref.attr({x1: nm_to_view(this.x1)});
    this.pad_line_ref.attr({y1: nm_to_view(this.y1)});
    this.pad_line_ref.attr({x2: nm_to_view(this.x2)});
    this.pad_line_ref.attr({y2: nm_to_view(this.y2)});

    this.update_anchors();
    this.update_distance_marker();

    $("#object_info").html(this.get_info());

    //console.log("Pad updated with attributes " + this.pad.attr());
};


Pad.prototype.update_editor = function() {
        code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"%d\" \"square\"]",
                nm_to_mm(this.x1),
                nm_to_mm(this.y1),
                nm_to_mm(this.x2),
                nm_to_mm(this.y2),
                nm_to_mm(this.thickness),
                nm_to_mm(this.clearance_margin),
                nm_to_mm(this.thickness + this.mask_margin),
                this.number
                );
        editor.replaceRange(code,
                {line: this.line_number, ch: 0},
                {line: this.line_number, ch: editor.getLine(this.line_number).length});
}


Pad.prototype.update_anchors = function() {

    pad_size = this.get_pad_size();

    this.anchor_c.attr({ cx: nm_to_view(                0), cy: nm_to_view(                 0), r: anchor_size});
    this.anchor_s.attr({ cx: nm_to_view(                0), cy: nm_to_view( pad_size.height/2), r: anchor_size});
    this.anchor_e.attr({ cx: nm_to_view( pad_size.width/2), cy: nm_to_view(                 0), r: anchor_size});
    this.anchor_n.attr({ cx: nm_to_view(                0), cy: nm_to_view(-pad_size.height/2), r: anchor_size});
    this.anchor_w.attr({ cx: nm_to_view(-pad_size.width/2), cy: nm_to_view(                 0), r: anchor_size});
    this.anchor_se.attr({cx: nm_to_view( pad_size.width/2), cy: nm_to_view( pad_size.height/2), r: anchor_size});
    this.anchor_sw.attr({cx: nm_to_view(-pad_size.width/2), cy: nm_to_view( pad_size.height/2), r: anchor_size});
    this.anchor_ne.attr({cx: nm_to_view( pad_size.width/2), cy: nm_to_view(-pad_size.height/2), r: anchor_size});
    this.anchor_nw.attr({cx: nm_to_view(-pad_size.width/2), cy: nm_to_view(-pad_size.height/2), r: anchor_size});

    this.anchors.transform("translate(" + nm_to_view(pad_size.x + pad_size.width/2) + "," + nm_to_view(pad_size.y + pad_size.height/2) + ")");
};

Pad.prototype.update_distance_marker = function() {

    if (global_first_endpoint_object == this) {

        var pad_size = this.get_pad_size();
        distance_x_line.attr({
            x1: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cx"),10)) + pad_size.x + pad_size.width/2),
            y1: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cy"),10)) + pad_size.y + pad_size.height/2),
            y2: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cy"),10)) + pad_size.y + pad_size.height/2)
        });
        distance_y_line.attr({
            y1: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cy"),10)) + pad_size.y + pad_size.height/2)
        });

        var distance_x_value = Math.round(distance_x_line.attr("x2") - distance_x_line.attr("x1"));
        var distance_y_value = Math.round(distance_y_line.attr("y2") - distance_y_line.attr("y1"));

        distance_x_text.attr({x: +distance_x_line.attr("x1") + distance_x_value/2, y: -distance_x_line.attr("y1") - 10, text: distance_x_value/100 + "mm"})
        distance_y_text.attr({x: +distance_y_line.attr("x1") + 10, y: -distance_y_line.attr("y1") - distance_y_value/2, text: distance_y_value/100 + "mm"})
        $("#status_xy_distance").text("(" + distance_x_value/100 + "mm, " + distance_y_value/100 + "mm)");
    }

    if (global_second_endpoint_object == this) {

        var pad_size = this.get_pad_size();
        distance_x_line.attr({
            x2: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cx"),10)) + pad_size.x + pad_size.width/2)
        });
        distance_y_line.attr({
            x1: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cx"),10)) + pad_size.x + pad_size.width/2),
            x2: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cx"),10)) + pad_size.x + pad_size.width/2),
            y2: nm_to_view(view_to_nm(parseInt(this.endpoint_anchor.attr("cy"),10)) + pad_size.y + pad_size.height/2)
        });

        var distance_x_value = Math.round(distance_x_line.attr("x2") - distance_x_line.attr("x1"));
        var distance_y_value = Math.round(distance_y_line.attr("y2") - distance_y_line.attr("y1"));

        distance_x_text.attr({x: +distance_x_line.attr("x1") + distance_x_value/2, y: -distance_x_line.attr("y1") - 10, text: distance_x_value/100 + "mm"})
        distance_y_text.attr({x: +distance_y_line.attr("x1") + 10, y: -distance_y_line.attr("y1") - distance_y_value/2, text: distance_y_value/100 + "mm"})
        $("#status_xy_distance").text("(" + distance_x_value/100 + "mm, " + distance_y_value/100 + "mm)");
    }

};

Pad.prototype.get_info = function() {

        pad_size = this.get_pad_size();

        pad_code = sprintf("<strong>Pad</strong><br />x: %.2fmm, y: %.2fmm<br /> Pad width: %.2fmm<br />Pad height: %.2fmm<br />Mask margin: %.2fmm<br />Clearance margin: %.2fmm",
                nm_to_mm(pad_size.x + pad_size.width/2),
                nm_to_mm(pad_size.y + pad_size.height/2),
                nm_to_mm(pad_size.width),
                nm_to_mm(pad_size.height),
                nm_to_mm(this.mask_margin),
                nm_to_mm(this.clearance_margin));

        return pad_code;
}

Pad.prototype.move = function(dx, dy) {

        this.x1 = this.x1 + dx;
        this.x2 = this.x2 + dx;
        this.y1 = this.y1 + dy;
        this.y2 = this.y2 + dy;

        this.update_editor();

}

Pad.prototype.select = function() {
    if (this.locked === false) {
        this.selected = true;
        this.graphical_group.attr({ opacity: 0.7 });
    }
}

Pad.prototype.unselect = function() {
    this.selected = false;
    this.graphical_group.attr({ opacity: 1 });
}

Pad.prototype.lock = function() {
    this.locked = true;
}

Pad.prototype.unlock = function() {
    this.locked = false;
}

function add_pad(e) {

    if (e.type == "dblclick") {
        var x1 = view_to_nm((e.clientX - origin_x - $('#svg').offset().left)/zoom_level);
        var y1 = view_to_nm((e.clientY - origin_y - $('#svg').offset().top )/zoom_level);

        x1 = Math.round(x1 / mm_to_nm(0.1)) * mm_to_nm(0.1);
        y1 = Math.round(y1 / mm_to_nm(0.1)) * mm_to_nm(0.1);

    } else {
        var x1 = 0;
        var y1 = 0;
    }

    var x2 = x1;
    var y2 = y1;

    var thickness = mm_to_nm(0.6);
    var mask_thickness = mm_to_nm(0.8);
    var clearance = mm_to_nm(1.0);
    var number = 1;

    pad_code = sprintf("    Pad[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"%d\" \"square\"]\n",
            nm_to_mm(x1),
            nm_to_mm(y1),
            nm_to_mm(x2),
            nm_to_mm(y2),
            nm_to_mm(thickness),
            nm_to_mm(clearance),
            nm_to_mm(mask_thickness),
            number
            );

    editor.replaceRange(pad_code, {line: get_last_line(), ch: 0});
}

function parse_pad_line(line) {
    if ( ! line.match(/Pad/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    var x1             = parse_length(code_line[0]);
    var y1             = parse_length(code_line[1]);
    var x2             = parse_length(code_line[2]);
    var y2             = parse_length(code_line[3]);
    var thickness      = parse_length(code_line[4]);
    var clearance      = parse_length(code_line[5]);
    var mask_thickness = parse_length(code_line[6]);
    var name           = code_line[7].replace(/"/g,"");
    var number         = code_line[8].replace(/"/g,"");
    var symbolic_flags = code_line[9].replace(/"/g,"");

    return {
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        thickness:thickness,
        clearance:clearance,
        mask_thickness:mask_thickness,
        name:name,
        number:number,
        symbolic_flags:symbolic_flags
    }

}

