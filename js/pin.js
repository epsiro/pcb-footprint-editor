function Pin(cx, cy, pad_diameter, clearance, mask_diameter, hole_diameter) {

    this.line_number = 0;

    var parentThis = this;

    this.cx = cx;
    this.cy = cy;
    this.hole_diameter = hole_diameter;
    this.pad_diameter = pad_diameter;
    this.mask_margin = mask_diameter - pad_diameter;
    this.clearance = clearance;

    this.pad = paper.circle(0, 0, 0).attr({
        fill: "#8c96a0"
    });

    this.mask = paper.circle(0, 0, 0).attr({
        stroke: "none",
        fill: "black"
    });

    this.hole = paper.circle(0, 0, 0).attr({
        fill: "white"
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

        global_dragging = true;

        highlight_pin();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

       //console.log($(this.node).hasClass("anchor_c"));
        switch (this.node.classList[0]) {

            case 'anchor_c':
               parentThis.cx = this.original_cx + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
               parentThis.cy = this.original_cy + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));
                break;

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
        }

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
        unhighlight_pin();
    };

    var highlight_pin = function(e) {
        if (global_dragging != true) {
            parentThis.pad.attr({
                fill: "#acb6c0"
            });

            parentThis.anchors.attr({
                visibility: "visible"
            });
            editor.addLineClass(parentThis.line_number, "background", "selected_pad");
        }
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
    };

    this.anchor_c.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_h.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_p.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.pad, this.mask, this.hole, this.anchors);
    this.graphical_group.hover(highlight_pin, unhighlight_pin);
    this.graphical_group.attr({class: "pin"});

}

Pin.prototype.update_editor = function() {

    //Pin [rX rY Thickness Clearance Mask Drill "Name" "Number" SFlags]
    code = sprintf("    Pin[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"\" \"\"]",
            nm_to_mm(this.cx),
            nm_to_mm(this.cy),
            nm_to_mm(this.pad_diameter),
            nm_to_mm(this.clearance),
            nm_to_mm(this.mask_margin + this.pad_diameter),
            nm_to_mm(this.hole_diameter)
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

    this.update_anchors();
}

function parse_pin(line) {
    if ( ! line.match(/Pin/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    //console.log(code_line);

    var cx            = parse_length(code_line[0]);
    var cy            = parse_length(code_line[1]);
    var pad_diameter  = parse_length(code_line[2]);
    var clearance     = parse_length(code_line[3]);
    var mask_diameter = parse_length(code_line[4]);
    var hole_diameter = parse_length(code_line[5]);

    return {
        cx:cx,
        cy:cy,
        pad_diameter:pad_diameter,
        clearance:clearance,
        mask_diameter:mask_diameter,
        hole_diameter:hole_diameter
    }

}

function add_pin(e) {
    var cx = view_to_nm($('#svg').offset().left + (e.clientX - origin_x)/zoom_level );
    var cy = view_to_nm($('#svg').offset().top  + (e.clientY - origin_y)/zoom_level );

    cx = Math.round(cx / mm_to_nm(0.1)) * mm_to_nm(0.1);
    cy = Math.round(cy / mm_to_nm(0.1)) * mm_to_nm(0.1);

    var hole_diameter = mm_to_nm(0.4);
    var pad_diameter = mm_to_nm(1.0);
    var clearance = mm_to_nm(0.1);
    var mask_diameter = mm_to_nm(1.2);

    code = sprintf("    Pin[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm %.2fmm \"\" \"\" \"\"]\n",
            nm_to_mm(cx),
            nm_to_mm(cy),
            nm_to_mm(pad_diameter),
            nm_to_mm(clearance),
            nm_to_mm(mask_diameter),
            nm_to_mm(hole_diameter)
            );

    editor.replaceRange(code, {line: get_last_line(), ch: 0});
}
