function ElementLine(x1, y1, x2, y2, thickness) {

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.thickness = thickness;

    this.line = paper.line(0, 0, 0, 0).attr({
        stroke: "black",
        strokeWidth: this.thickness
    });

    this.anchor_c  = paper.circle(0, 0, anchor_size).addClass("anchor_c");
    this.anchor_e1 = paper.circle(0, 0, anchor_size).addClass("anchor_e1");
    this.anchor_e2 = paper.circle(0, 0, anchor_size).addClass("anchor_e2");

    this.anchors = paper.group(
        this.anchor_c,
        this.anchor_e1,
        this.anchor_e2
    ).attr({
        fill: "red",
        stroke: "#445",
        strokeWidth: 2,
        visibility: "hidden"
    });

    this.update_anchors();

    this.elementline_group = paper.group(this.line, this.anchors);
    this.elementline_group.attr({class: "elementline"});

    this.draw();

}

ElementLine.prototype.update_anchors = function() {

    this.anchor_c.attr( { cx: nm_to_view((this.x2-this.x1)/2), cy:nm_to_view((this.y2-this.y1)/2)});
    this.anchor_e1.attr({ cx:             nm_to_view(this.x1), cy:            nm_to_view(this.y1)});
    this.anchor_e2.attr({ cx:             nm_to_view(this.x2), cy:            nm_to_view(this.y2)});
};

ElementLine.prototype.draw = function() {
    this.line.attr({x1: nm_to_view(this.x1), y1: nm_to_view(this.y1), x2: nm_to_view(this.x2), y2: nm_to_view(this.y2)});
}
