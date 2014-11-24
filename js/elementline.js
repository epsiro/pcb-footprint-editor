function ElementLine(x1, y1, x2, y2, thickness) {

    this.line_number = 0;

    var parentThis = this;

    this.selected = false;
    this.locked = false;

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

        this.last_dx = 0;
        this.last_dy = 0;

        //console.log(this.inal_x1);

        global_dragging = true;

        highlight_elementline();
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

        /* Inspect cursor to determine which resize/move process to use */
        switch (this.node.classList[0]) {

            case 'anchor_e1':
                parentThis.x1 = this.original_x1 + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
                parentThis.y1 = this.original_y1 + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));
                break;

            case 'anchor_e2':
                parentThis.x2 = this.original_x2 + view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
                parentThis.y2 = this.original_y2 + view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));
                break;

            case 'anchor_c':
            default:
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

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
        unhighlight_elementline();
    };

    var highlight_elementline = function(e) {
        if (global_dragging != true && parentThis.locked === false) {

            //parentThis.selected = true;

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

            //parentThis.selected = false;

            parentThis.line.attr({
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
    this.anchor_e1.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_e2.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.line.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.line, this.anchors);
    this.graphical_group.hover(highlight_elementline, unhighlight_elementline);
    this.graphical_group.click(toggle_select);
    this.graphical_group.attr({class: "elementline"});

    /* Start drag event on anchor*/
    if (file_loaded != true) {
        highlight_elementline();
        var e = new Event("mousedown" );
        e.clientX = $('#svg').offset().left + origin_x + nm_to_view(this.x1)*zoom_level;
        e.clientY = $('#svg').offset().top  + origin_y + nm_to_view(this.y1)*zoom_level;
        this.anchor_e2.node.dispatchEvent(e);
    }

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

    this.anchor_c.attr( { cx: nm_to_view(this.x1 + (this.x2-this.x1)/2), cy:nm_to_view(this.y1 + (this.y2-this.y1)/2), r: anchor_size});
    this.anchor_e1.attr({ cx:                       nm_to_view(this.x1), cy:                      nm_to_view(this.y1), r: anchor_size});
    this.anchor_e2.attr({ cx:                       nm_to_view(this.x2), cy:                      nm_to_view(this.y2), r: anchor_size});
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

ElementLine.prototype.move = function(dx, dy) {

        this.x1 = this.x1 + dx;
        this.x2 = this.x2 + dx;
        this.y1 = this.y1 + dy;
        this.y2 = this.y2 + dy;

        this.update_editor();

}

ElementLine.prototype.select = function() {
    if (this.locked === false) {
        this.selected = true;
        this.graphical_group.attr({ opacity: 0.7 });
    }
}

ElementLine.prototype.unselect = function() {
    this.selected = false;
    this.graphical_group.attr({ opacity: 1 });
}

ElementLine.prototype.lock = function() {
    this.locked = true;
}

ElementLine.prototype.unlock = function() {
    this.locked = false;
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

function add_elementline(e) {
    var x1 = view_to_nm((e.clientX - origin_x - $('#svg').offset().left)/zoom_level);
    var y1 = view_to_nm((e.clientY - origin_y - $('#svg').offset().top )/zoom_level);

    x1 = Math.round(x1 / mm_to_nm(0.1)) * mm_to_nm(0.1);
    y1 = Math.round(y1 / mm_to_nm(0.1)) * mm_to_nm(0.1);

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
