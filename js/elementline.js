function ElementLine(x1, y1, x2, y2, thickness) {

    this.line_number = 0;

    var parentThis = this;

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.thickness = thickness;

    this.line = paper.line(0, 0, 0, 0).attr({
        stroke: "black",
        strokeLinecap: "round"
    });

    this.anchor_c  = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_e1 = paper.circle(0, 0, anchor_size).addClass("anchor_e1");
    this.anchor_e2 = paper.circle(0, 0, anchor_size).addClass("anchor_e2");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_e1,
        this.anchor_e2
    ).attr({
        fill: "white",
        //stroke: "#445",
        stroke: "red",
        strokeWidth: 2,
        visibility: "hidden"
    });

    this.update_anchors();

    var drag_anchor_start = function(e) {

        this.original_x1 = parentThis.x1;
        this.original_y1 = parentThis.y1;
        this.original_x2 = parentThis.x2;
        this.original_y2 = parentThis.y2;
        this.original_thickness = parentThis.thickness;

        //console.log(this.inal_x1);

        global_dragging = true;

        highlight_elementline();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.node.classList[0]) {

            case 'anchor_c':
                parentThis.x1 = this.original_x1 + view_to_nm(dx/zoom_level);
                parentThis.y1 = this.original_y1 - view_to_nm(dy/zoom_level);
                parentThis.x2 = this.original_x2 + view_to_nm(dx/zoom_level);
                parentThis.y2 = this.original_y2 - view_to_nm(dy/zoom_level);
                break;

            case 'anchor_e1':
                parentThis.x1 = this.original_x1 + view_to_nm(dx/zoom_level);
                parentThis.y1 = this.original_y1 - view_to_nm(dy/zoom_level);
                break;

            case 'anchor_e2':
                parentThis.x2 = this.original_x2 + view_to_nm(dx/zoom_level);
                parentThis.y2 = this.original_y2 - view_to_nm(dy/zoom_level);
                break;
        }

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
        unhighlight_elementline();
    };

    var highlight_elementline = function(e) {
        if (global_dragging != true) {
            parentThis.line.attr({
                stroke: "#222"
            });

            parentThis.anchors.attr({
                visibility: "visible"
            });
            editor.addLineClass(parentThis.line_number, "background", "selected_pad");
        }
    };

    var unhighlight_elementline = function(e) {
        if (global_dragging != true) {
            parentThis.line.attr({
                stroke: "black"
            });
            parentThis.anchors.attr({
                visibility: "hidden"
            });
            editor.removeLineClass(parentThis.line_number, "background", "selected_pad");
        }
    };

    this.anchor_c.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_e1.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_e2.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.line, this.anchors);
    this.graphical_group.hover(highlight_elementline, unhighlight_elementline);
    this.graphical_group.attr({class: "elementline"});

    /* Start drag event on anchor*/
    highlight_elementline();
    var e = new Event("mousedown" );
    e.clientX = origin_x + nm_to_view(this.x1);
    e.clientY = origin_y - nm_to_view(this.y1);
    this.anchor_e2.node.dispatchEvent(e);

}

ElementLine.prototype.update_editor = function() {

    code = sprintf("    ElementLine[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm]",
            nm_to_mm(this.x1),
            nm_to_mm(this.y1),
            nm_to_mm(this.x2),
            nm_to_mm(this.y2),
            nm_to_mm(this.thickness));

    editor.replaceRange(
        code,
        {line: this.line_number, ch: 0},
        {line: this.line_number, ch: editor.getLine(this.line_number).length}
    );
}

ElementLine.prototype.update_anchors = function() {

    this.anchor_c.attr( { cx: nm_to_view(this.x1 + (this.x2-this.x1)/2), cy:nm_to_view(this.y1 + (this.y2-this.y1)/2)});
    this.anchor_e1.attr({ cx:                       nm_to_view(this.x1), cy:                      nm_to_view(this.y1)});
    this.anchor_e2.attr({ cx:                       nm_to_view(this.x2), cy:                      nm_to_view(this.y2)});
};

ElementLine.prototype.draw = function() {
    this.line.attr({
        x1: nm_to_view(this.x1),
        y1: nm_to_view(this.y1),
        x2: nm_to_view(this.x2),
        y2: nm_to_view(this.y2),
        strokeWidth: nm_to_view(this.thickness)
    });

    this.update_anchors();
}

function parse_elementline(line) {
    if ( ! line.match(/ElementLine/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);

    //console.log(code_line);

    var x1 = parse_length(code_line[0]);
    var y1 = parse_length(code_line[1]);
    var x2 = parse_length(code_line[2]);
    var y2 = parse_length(code_line[3]);
    var thickness = parse_length(code_line[4]);

    return {
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        thickness:thickness
    }

}

function parse_length(s) {

    var pos_mm = s.indexOf("mm");
    if (pos_mm > -1) {
        return mm_to_nm(s.slice(0, pos_mm).trim());

    }

    var pos_mil = s.indexOf("mil");
    if (pos_mil > -1) {
        return mil_to_nm(s.slice(0, pos_mil).trim());
    }
}

function add_elementline(e) {

    var x1 = view_to_nm( (e.clientX - origin_x)/zoom_level );
    var y1 = view_to_nm(-(e.clientY - origin_y)/zoom_level );

    //x1 = Math.round(x1 * 10) / 10;
    //y1 = Math.round(y1 * 10) / 10;

    var x2 = x1;
    var y2 = y1;

    var thickness = mm_to_nm(0.2);

    code = sprintf("    ElementLine[%.2fmm %.2fmm %.2fmm %.2fmm %.2fmm]\n",
            nm_to_mm(x1),
            nm_to_mm(y1),
            nm_to_mm(x2),
            nm_to_mm(y2),
            nm_to_mm(thickness));

    editor.replaceRange(code, {line: get_last_line(), ch: 0});
}
