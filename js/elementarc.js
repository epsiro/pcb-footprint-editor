function polar_to_cartesian(center_x, center_y, radius, angle_in_degrees) {
    var angle_in_radians = (angle_in_degrees - 90) * Math.PI / 180.0;

    return {
        x: center_x + (radius * Math.cos(angle_in_radians)),
        y: center_y + (radius * Math.sin(angle_in_radians))
    };
}

function describe_arc_path(x, y, radius, start_angle, delta_angle){

    if (delta_angle == 360) {

        var circle_path = [
            "M", x, y,
            "m", -radius, 0,
            "a", radius, radius, 0, 1, 1,  (2*radius), 0,
            "a", radius, radius, 0, 1, 1, -(2*radius), 0,
                ].join(" ");

        return circle_path;

    }

    var start = polar_to_cartesian(x, y, radius, -start_angle - 90);
    var end = polar_to_cartesian(x, y, radius, -start_angle - delta_angle - 90);

    var large_arc_flag = delta_angle > -180 && delta_angle < 180 ? "0" : "1";
    var sweep_flag = delta_angle < 0 ? "1" : "0";

    var arc_path = [
        "M", start.x, start.y,
        "A", radius, radius, 0, large_arc_flag, sweep_flag, end.x, end.y
            ].join(" ");

    return arc_path;
}
