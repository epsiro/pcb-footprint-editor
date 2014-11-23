function ElementArc(rx, ry, width, height, start_angle, delta_angle, thickness) {

    this.line_number = 0;

    var parentThis = this;

    this.selected = false;
    this.locked = false;

    this.rx = rx;
    this.ry = ry;
    this.width = width;
    this.height = height;
    this.start_angle = start_angle;
    this.delta_angle = delta_angle;
    this.thickness = thickness;

    this.arc  = paper.path("").attr({
        fill: "none",
        stroke: "black",
        strokeWidth: nm_to_view(this.thickness),
        strokeLinecap: "round"
    });

    this.anchor_c = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_m = paper.circle(0, 0, anchor_size).addClass("anchor_m");
    this.anchor_s = paper.circle(0, 0, anchor_size).addClass("anchor_s");
    this.anchor_e = paper.circle(0, 0, anchor_size).addClass("anchor_e");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_m,
        this.anchor_s,
        this.anchor_e
    ).attr({
        fill: "white",
        //stroke: "#445",
        stroke: "red",
        strokeWidth: 2,
        visibility: "hidden"
    });

    this.anchor_c.attr({
        visibility: "visible"
    });

    this.update_anchors();

    var drag_anchor_start = function(e) {

        this.original_rx = parentThis.rx;
        this.original_ry = parentThis.ry;
        this.original_width = parentThis.width;
        this.original_height = parentThis.height;
        this.original_start_angle = parentThis.start_angle;
        this.original_delta_angle = parentThis.delta_angle;
        this.original_thickness = parentThis.thickness;

        this.original_anchor_cx = this.attr("cx");
        this.original_anchor_cy = this.attr("cy");

        global_dragging = true;

        highlight_elementarc();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.node.classList[0]) {

            case 'anchor_c':
                parentThis.rx = this.original_rx + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
                parentThis.ry = this.original_ry + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));
                break;

            case 'anchor_m':
                var polar_coord = cartesian_to_polar(nm_to_view(this.original_rx), nm_to_view(this.original_ry), +this.original_anchor_cx + dx/zoom_level, +this.original_anchor_cy + dy/zoom_level);

                parentThis.width  = Math.round(view_to_nm(polar_coord.radius) / mm_to_nm(0.1))*mm_to_nm(0.1);
                parentThis.height = parentThis.width;
                break;

            case 'anchor_s':
                var polar_coord = cartesian_to_polar(nm_to_view(this.original_rx), nm_to_view(this.original_ry), +this.original_anchor_cx + dx/zoom_level, +this.original_anchor_cy + dy/zoom_level);

                parentThis.start_angle = Math.round(polar_coord.angle / 10) * 10;
                //parentThis.delta_angle = +this.original_delta_angle - parentThis.start_angle;
                break;

            case 'anchor_e':
                var polar_coord = cartesian_to_polar(nm_to_view(this.original_rx), nm_to_view(this.original_ry), +this.original_anchor_cx + dx/zoom_level, +this.original_anchor_cy + dy/zoom_level);
                console.log(polar_coord);

                parentThis.delta_angle = Math.round(polar_coord.angle / 10) * 10 - parentThis.start_angle;

                if (Math.abs(parentThis.delta_angle) > 360) {
                    parentThis.delta_angle = sign(parentThis.delta_angle)*360;
                }

                break;
        }

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
        unhighlight_elementarc();
    };

    var highlight_elementarc = function(e) {
        if (global_dragging != true && parentThis.locked === false) {

            //parentThis.selected = true;

            parentThis.arc.attr({
                stroke: "#222"
            });

            parentThis.anchors.attr({
                visibility: "visible"
            });
            editor.addLineClass(parentThis.line_number, "background", "selected_pad");
        }
    };

    var unhighlight_elementarc = function(e) {
        if (global_dragging != true) {

            //parentThis.selected = false;

            parentThis.arc.attr({
                stroke: "black"
            });
            parentThis.anchors.attr({
                visibility: "hidden"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
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
    this.anchor_m.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_s.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_e.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.arc, this.anchors);
    this.graphical_group.hover(highlight_elementarc, unhighlight_elementarc);
    this.graphical_group.click(toggle_select);
    this.graphical_group.attr({class: "elementarc"});

    /* Start drag event on anchor*/
    if (file_loaded != true) {
        highlight_elementarc();
        var e = new Event("mousedown" );
        e.clientX = $('#svg').offset().left + origin_x + nm_to_view(this.rx + this.width)*zoom_level;
        e.clientY = $('#svg').offset().top  + origin_y + nm_to_view(this.ry)*zoom_level;
        this.anchor_m.node.dispatchEvent(e);
    }

}

ElementArc.prototype.update_editor = function() {

    code = sprintf("    ElementArc[%.2fmm %.2fmm %.2fmm %.2fmm %d %d %.2fmm]",
            nm_to_mm(this.rx),
            nm_to_mm(this.ry),
            nm_to_mm(this.width),
            nm_to_mm(this.height),
            this.start_angle,
            this.delta_angle,
            nm_to_mm(this.thickness));

    editor.replaceRange(
        code,
        {line: this.line_number, ch: 0},
        {line: this.line_number, ch: editor.getLine(this.line_number).length}
    );
}

ElementArc.prototype.update_anchors = function() {

    var coord;

    this.anchor_c.attr( { cx: nm_to_view(this.rx), cy: nm_to_view(this.ry) });

    coord = polar_to_cartesian(nm_to_view(this.rx), nm_to_view(this.ry), nm_to_view(this.width), nm_to_view(this.height), -this.start_angle - 90);
    this.anchor_s.attr({ cx: coord.x, cy: coord.y });

    coord = polar_to_cartesian(nm_to_view(this.rx), nm_to_view(this.ry), nm_to_view(this.width), nm_to_view(this.height), -this.start_angle - this.delta_angle/2 - 90);
    this.anchor_m.attr({ cx: coord.x, cy: coord.y });

    coord = polar_to_cartesian(nm_to_view(this.rx), nm_to_view(this.ry), nm_to_view(this.width), nm_to_view(this.height), -this.start_angle - this.delta_angle - 90);
    this.anchor_e.attr({ cx: coord.x, cy: coord.y });
};

ElementArc.prototype.draw = function() {
    this.arc.attr({
        d: describe_arc_path(nm_to_view(this.rx), nm_to_view(this.ry), nm_to_view(this.width), nm_to_view(this.height), this.start_angle, this.delta_angle),
        strokeWidth: nm_to_view(this.thickness)
    });

    this.update_anchors();
}

ElementArc.prototype.select = function() {
    if (this.locked === false) {
        this.selected = true;
        this.graphical_group.attr({ opacity: 0.7 });
    }
}

ElementArc.prototype.unselect = function() {
    this.selected = false;
    this.graphical_group.attr({ opacity: 1 });
}

ElementArc.prototype.lock = function() {
    this.locked = true;
}

ElementArc.prototype.unlock = function() {
    this.locked = false;
}

function parse_elementarc(line) {
    if ( ! line.match(/ElementArc/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    var rx = parse_length(code_line[0]);
    var ry = parse_length(code_line[1]);
    var width = parse_length(code_line[2]);
    var height = parse_length(code_line[3]);
    var start_angle = code_line[4].trim();
    var delta_angle = code_line[5].trim();
    var thickness = parse_length(code_line[6]);

    return {
        rx: rx,
        ry: ry,
        width: width,
        height: height,
        start_angle: start_angle,
        delta_angle: delta_angle,
        thickness: thickness
    }

}

function add_elementarc(e) {
    var rx = view_to_nm((e.clientX - origin_x - $('#svg').offset().left)/zoom_level);
    var ry = view_to_nm((e.clientY - origin_y - $('#svg').offset().top )/zoom_level);

    rx = Math.round(rx / mm_to_nm(0.1)) * mm_to_nm(0.1);
    ry = Math.round(ry / mm_to_nm(0.1)) * mm_to_nm(0.1);

    var width = mm_to_nm(0);
    var height = mm_to_nm(0);
    var start_angle = 0;
    var delta_angle = 360;
    var thickness = mm_to_nm(0.2);

    code = sprintf("    ElementArc[%.2fmm %.2fmm %.2fmm %.2fmm %d %d %.2fmm]\n",
            nm_to_mm(rx),
            nm_to_mm(ry),
            nm_to_mm(width),
            nm_to_mm(height),
            start_angle,
            delta_angle,
            nm_to_mm(thickness));

    editor.replaceRange(code, {line: get_last_line(), ch: 0});
}

function polar_to_cartesian(center_x, center_y, radius_x, radius_y, angle_in_degrees) {
    var angle_in_radians = (angle_in_degrees - 90) * Math.PI / 180.0;

    return {
        x: center_x + (radius_x * Math.cos(angle_in_radians)),
        y: center_y + (radius_y * Math.sin(angle_in_radians))
    };
}

function cartesian_to_polar(center_x, center_y, coord_x, coord_y) {

    var x = coord_x - center_x;
    var y = coord_y - center_y;

    return {
        radius: Math.sqrt(x*x + y*y),
        angle: (360.0 - ((Math.atan2(y, x) * 180.0 / Math.PI) + 180.0))
    };
}

function describe_arc_path(x, y, radius_x, radius_y, start_angle, delta_angle){

    if (delta_angle == 360) {

        var circle_path = [
            "M", x, y,
            "m", -radius_x, 0,
            "a", radius_x, radius_y, 0, 1, 1,  (2*radius_x), 0,
            "a", radius_x, radius_y, 0, 1, 1, -(2*radius_x), 0,
                ].join(" ");

        return circle_path;

    }

    if (Math.abs(delta_angle) > 360) {
        delta_angle = sign(delta_angle)*360;
    }

    var start = polar_to_cartesian(x, y, radius_x, radius_y, -start_angle - 90);
    var end = polar_to_cartesian(x, y, radius_x, radius_y, -start_angle - delta_angle - 90);

    var large_arc_flag = delta_angle > -180 && delta_angle < 180 ? "0" : "1";
    var sweep_flag = delta_angle < 0 ? "1" : "0";

    var arc_path = [
        "M", start.x, start.y,
        "A", radius_x, radius_y, 0, large_arc_flag, sweep_flag, end.x, end.y
            ].join(" ");

    return arc_path;
}
