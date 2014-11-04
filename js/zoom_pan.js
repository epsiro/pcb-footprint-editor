function mouse_wheel_handler (ev) {
    ev.preventDefault();

    if (ev.wheelDelta > 0) {
        if (zoom_level < 3) {
            zoom_level += 0.25;
        }
    } else {
        if (zoom_level > 0.25) {
            zoom_level -= 0.25;
        }
    }

    zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");

}

var begin_drag_workspace = function() {
    if (global_dragging == true) {
        return;
    }

    this.origin_x = origin_x;
    this.origin_y = origin_y;
};

var drag_workspace = function(dx, dy, posx, posy) {
    if (global_dragging == true) {
        return;
    }

    origin_x = this.origin_x + dx;
    origin_y = this.origin_y + dy;
    zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");
}

paper.node.addEventListener("mousewheel", mouse_wheel_handler, false);
paper.drag(drag_workspace, begin_drag_workspace, null);

var zoom_level = 1;

var zoom_group = paper.group(grid_small, grid_big, center, distance_x, distance_y);
zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + -zoom_level + ")");
