function Pin(cx, cy, pad_diameter, clearance, mask_diameter, hole_diameter, number) {

    this.line_number = 0;
    this.number = number;

    var parentThis = this;

    this.selected = false;
    this.locked = false;

    this.cx = cx;
    this.cy = cy;
    this.hole_diameter = hole_diameter;
    this.pad_diameter = pad_diameter;
    this.mask_margin = mask_diameter - pad_diameter;
    this.clearance_margin = clearance;

    this.pad = paper.circle(0, 0, 0).attr({
        fill: "#8c96a0"
    });

    this.mask = paper.circle(0, 0, 0).attr({
        stroke: "none",
        fill: "black"
    });

    this.clearance = paper.circle(0, 0, 0).attr({
        stroke: "none",
        fill: "black"
    });

    this.hole = paper.circle(0, 0, 0).attr({
        fill: "white"
    });

    this.show_number = paper.text(0, 0, "").attr({
        "font-size": 42,
        fill: "red",
        textAnchor: "middle",
        "alignment-baseline": "central",
        visibility: "visible"
    });

    console.log(this);

    this.anchor_c = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_h = paper.circle(0, 0, anchor_size).addClass("anchor_h");
    this.anchor_p = paper.circle(0, 0, anchor_size).addClass("anchor_p");

    console.log(this);

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_h,
        this.anchor_p
    ).attr({
        fill: "white",
        stroke: "#445",
        strokewidth: 2,
        visibility: "hidden"
    });

    this.update_anchors();

    var drag_anchor_start = function(e) {

        this.original_cx = parentThis.cx;
        this.original_cy = parentThis.cy;
        this.original_hole_diameter = parentThis.hole_diameter;
        this.original_pad_diameter = parentThis.pad_diameter;

        this.last_dx = 0;
        this.last_dy = 0;

        global_dragging = true;

        highlight_pin();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

       //console.log($(this.node).hasClass("anchor_c"));
        switch (this.node.classList[0]) {

        case 'anchor_h':
            var new_hole_diameter = this.original_hole_diameter + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)*2);
            if ( new_hole_diameter > 0 && new_hole_diameter < parentThis.pad_diameter) {
                parentThis.hole_diameter = new_hole_diameter;
            }
            break;

        case 'anchor_p':
            var new_pad_diameter = this.original_pad_diameter + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30)*2);
            if ( new_pad_diameter > 0 && new_pad_diameter > parentThis.hole_diameter) {
                parentThis.pad_diameter = new_pad_diameter;
            }
            break;

        case 'anchor_c':
        default:
            var dx = view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
            var dy = view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));

            if (parentThis.selected == false ) {
                parentThis.move(dx - this.last_dx, dy - this.last_dy);
            } else {
                move_selected_objects(dx - this.last_dx, dy - this.last_dy);
            }

            this.last_dx = dx;
            this.last_dy = dy;

            break;

        }

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
        unhighlight_pin();
    };

    var highlight_pin = function(e) {
        if (global_dragging != true && parentThis.locked === false) {

            parentThis.pad.attr({
                fill: "#acb6c0"
            });

            parentThis.anchors.attr({
                visibility: "visible"
            });
            editor.addLineClass(parentThis.line_number, "background", "selected_pad");
        }

        $("#object_info").show().html(parentThis.get_info());
    };

    var unhighlight_pin = function(e) {
        if (global_dragging != true) {

            parentThis.pad.attr({
                fill: "#8c96a0"
            });
            parentThis.anchors.attr({
                visibility: "hidden"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
        }

        $("#object_info").hide();
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
    this.anchor_h.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_p.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.pad.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.hole.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.show_number.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.pad, this.clearance, this.mask, this.hole, this.show_number, this.anchors);
    this.graphical_group.hover(highlight_pin, unhighlight_pin);
    this.graphical_group.click(toggle_select);
    this.graphical_group.attr({class: "pin"});

}

Pin.prototype.update_editor = function() {

    //Pin [rX rY Thickness Clearance Mask Drill "Name" "Number" SFlags]
    code = sprintf("    Pin[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"%d\" \"\"]",
            nm_to_mm(this.cx),
            nm_to_mm(this.cy),
            nm_to_mm(this.pad_diameter),
            nm_to_mm(this.clearance_margin),
            nm_to_mm(this.mask_margin + this.pad_diameter),
            nm_to_mm(this.hole_diameter),
            this.number
            );

    editor.replaceRange(
        code,
        {line: this.line_number, ch: 0},
        {line: this.line_number, ch: editor.getLine(this.line_number).length}
    );
}

Pin.prototype.update_anchors = function() {

    this.anchor_c.attr({ cx: nm_to_view(this.cx),                        cy: nm_to_view(this.cy), r: anchor_size});
    this.anchor_h.attr({ cx: nm_to_view(this.cx + this.hole_diameter/2), cy: nm_to_view(this.cy), r: anchor_size});
    this.anchor_p.attr({ cx: nm_to_view(this.cx + this.pad_diameter/2),  cy: nm_to_view(this.cy), r: anchor_size});
};

Pin.prototype.draw = function() {
    this.mask.attr({
        cx: nm_to_view(this.cx),
        cy: nm_to_view(this.cy),
        r: nm_to_view((this.mask_margin + this.pad_diameter)/2)
    });

    this.clearance.attr({
        cx: nm_to_view(this.cx),
        cy: nm_to_view(this.cy),
        r: nm_to_view((this.clearance_margin + this.pad_diameter)/2)
    });

    this.pad.attr({
        cx: nm_to_view(this.cx),
        cy: nm_to_view(this.cy),
        r: nm_to_view(this.pad_diameter/2)
    });

    this.hole.attr({
        cx: nm_to_view(this.cx),
        cy: nm_to_view(this.cy),
        r: nm_to_view(this.hole_diameter/2)
    });

    this.show_number.attr({
        x: nm_to_view(this.cx),
        y: nm_to_view(this.cy),
        text: this.number
    });

    $("#object_info").html(this.get_info());

    this.update_anchors();
}

Pin.prototype.get_info = function() {

        pad_code = sprintf("<strong>Pin</strong><br />x: %.2fmm, y: %.2fmm<br />Pad diameter: %.2fmm<br />Hole diameter: %.2fmm<br />Mask margin: %.2fmm<br />Clearance: %.2fmm",
                nm_to_mm(this.cx),
                nm_to_mm(this.cy),
                nm_to_mm(this.pad_diameter),
                nm_to_mm(this.hole_diameter),
                nm_to_mm(this.mask_margin),
                nm_to_mm(this.clearance_margin));

        return pad_code;
}

Pin.prototype.move = function(dx, dy) {

        this.cx = this.cx + dx;
        this.cy = this.cy + dy;

        this.update_editor();

}

Pin.prototype.select = function() {
    if (this.locked === false) {
        this.selected = true;
        this.graphical_group.attr({ opacity: 0.7 });
    }
}

Pin.prototype.unselect = function() {
    this.selected = false;
    this.graphical_group.attr({ opacity: 1 });
}

Pin.prototype.lock = function() {
    this.locked = true;
}

Pin.prototype.unlock = function() {
    this.locked = false;
}

function parse_pin(line) {
    if ( ! line.match(/Pin/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    //console.log(code_line);

    var cx             = parse_length(code_line[0]);
    var cy             = parse_length(code_line[1]);
    var pad_diameter   = parse_length(code_line[2]);
    var clearance      = parse_length(code_line[3]);
    var mask_diameter  = parse_length(code_line[4]);
    var hole_diameter  = parse_length(code_line[5]);
    var name           = code_line[6].replace(/"/g,"");
    var number         = code_line[7].replace(/"/g,"");
    var symbolic_flags = code_line[8].replace(/"/g,"");

    return {
        cx:cx,
        cy:cy,
        pad_diameter:pad_diameter,
        clearance:clearance,
        mask_diameter:mask_diameter,
        hole_diameter:hole_diameter,
        name:name,
        number:number,
        symbolic_flags:symbolic_flags
    }

}

function add_pin(e) {
    var cx = view_to_nm((e.clientX - origin_x - $('#svg').offset().left)/zoom_level);
    var cy = view_to_nm((e.clientY - origin_y - $('#svg').offset().top )/zoom_level);

    cx = Math.round(cx / mm_to_nm(0.1)) * mm_to_nm(0.1);
    cy = Math.round(cy / mm_to_nm(0.1)) * mm_to_nm(0.1);

    var hole_diameter = mm_to_nm(0.4);
    var pad_diameter = mm_to_nm(1.0);
    var clearance = mm_to_nm(1.0);
    var mask_diameter = mm_to_nm(1.2);
    var number = 1;

    code = sprintf("    Pin[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"%d\" \"\"]\n",
            nm_to_mm(cx),
            nm_to_mm(cy),
            nm_to_mm(pad_diameter),
            nm_to_mm(clearance),
            nm_to_mm(mask_diameter),
            nm_to_mm(hole_diameter),
            number
            );

    editor.replaceRange(code, {line: get_last_line(), ch: 0});
}
