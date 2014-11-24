function Refdes(refdes_text, x, y, text_scale) {

    this.x = x;
    this.y = y;
    this.refdes_text = refdes_text;

    var parentThis = this;

    this.orig_font_size = mil_to_nm(40);
    this.text_scale = text_scale;

    this.refdes = paper.text(0, 0, "").attr({"font-size": 92});

    this.anchor_c = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_t = paper.circle(0, 0, anchor_size).addClass("anchor_t");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_t
    ).attr({
        fill: "white",
        stroke: "#445",
        strokewidth: 2//,
        //visibility: "hidden"
    });

    var drag_anchor_start = function(e) {

        this.original_x = parentThis.x;
        this.original_y = parentThis.y;

        this.last_dx = 0;
        this.last_dy = 0;

        global_dragging = true;
    };

    var drag_anchor = function(dx, dy, posx, posy, e) {

        var grid = 10;

       //console.log($(this.node).hasClass("anchor_c"));
        switch (this.node.classList[0]) {

        case 'anchor_t':
            break;

        case 'anchor_c':
        default:
            var dx = view_to_nm(Snap.snapTo(grid, dx/zoom_level, 30));
            var dy = view_to_nm(Snap.snapTo(grid, dy/zoom_level, 30));

            parentThis.move(dx - this.last_dx, dy - this.last_dy);

            this.last_dx = dx;
            this.last_dy = dy;
            break;
        }

        parentThis.update_editor();
    };

    var drag_anchor_end = function() {
        global_dragging = false;
    };

    this.anchor_c.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.anchor_t.drag(drag_anchor, drag_anchor_start, drag_anchor_end);
    this.refdes.drag(drag_anchor, drag_anchor_start, drag_anchor_end);

    this.graphical_group = paper.group(this.refdes, this.anchors);
    this.draw();
};

Refdes.prototype.draw = function() {

    if (this.refdes_text == "") {
        var refdes_text = "X1";
    } else {
        var refdes_text = this.refdes_text;
    }

    this.refdes.attr({
        x: nm_to_view(this.x),
        y: nm_to_view(this.y),
        text: refdes_text
    });

    var scale_factor = this.text_scale/100;
    this.refdes.transform("translate(" + -nm_to_view(this.x)*(scale_factor - 1) + "," + -nm_to_view(this.y)*(scale_factor - 1) + ") scale(" + scale_factor + ")");

    //console.log(nm_to_mil(view_to_nm(this.refdes.getBBox().height)));

    this.update_anchors();
}

Refdes.prototype.update_anchors = function() {

    this.anchor_c.attr({ cx: nm_to_view(this.x), cy: nm_to_view(this.y), r: anchor_size});
    this.anchor_t.attr({ cx: nm_to_view(this.x), cy: nm_to_view(this.y - 0.5*this.orig_font_size*this.text_scale/100), r: anchor_size});
};

Refdes.prototype.move = function(dx, dy) {

        this.x = this.x + dx;
        this.y = this.y + dy;

        this.update_editor();
}

Refdes.prototype.update_editor = function() {

    code = sprintf("Element[\"\" \"\" \"%s\" \"\" %.2fmm %.2fmm %.2fmm %.2fmm %d %d \"\"]",
            this.refdes_text,
            1,
            1,
            nm_to_mm(this.x),
            nm_to_mm(this.y),
            0,
            this.text_scale
        );

    editor.replaceRange(
        code,
        {line: this.line_number, ch: 0},
        {line: this.line_number, ch: editor.getLine(this.line_number).length}
    );
}

Refdes.prototype.select = function() {};
Refdes.prototype.unselect = function() {};
Refdes.prototype.lock = function() {};
Refdes.prototype.unlock = function() {};

function parse_element(line) {
    if ( ! line.match(/Element\[/)) {
        throw new UserException("InvalidFormat");
    }

    code_line = line.substring(line.indexOf('[') + 1).match(/\S+/g);
    //code_line.match(/\w+(\".*?\")?/g)

    //console.log(code_line);

    var symbolic_flags = code_line[0].replace(/"/g,"");
    var description = code_line[1].replace(/"/g,"");
    var name = code_line[2].replace(/"/g,"");
    var value = code_line[3].replace(/"/g,"");
    var mark_x = parse_length(code_line[4]);
    var mark_y = parse_length(code_line[5]);
    var text_pos_x = parse_length(code_line[6]);
    var text_pos_y = parse_length(code_line[7]);
    var text_direction = code_line[8];
    var text_scale = code_line[9];
    var text_symbolic_flags = code_line[10].replace(/"/g,"");

    return {
        symbolic_flags: symbolic_flags,
        description: description,
        name: name,
        value: value,
        mark_x: mark_x,
        mark_y: mark_y,
        text_pos_x: text_pos_x,
        text_pos_y: text_pos_y,
        text_direction: text_direction,
        text_scale: text_scale,
        text_symbolic_flags: text_symbolic_flags
    }

}

