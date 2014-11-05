function add_new_object(line) {

    var changed_line = editor.getLine(line);

    if (changed_line.match(/Pad/)) {
        values = parse_pad_line(changed_line);
        pad_instance = new Pad(line, line,
                values.x1,
                values.y1,
                values.x2,
                values.y2,
                values.thickness
                );

        console.log("Pad added in objects[%d]: %s", line, pad_instance);
        pad_instance.draw();
        zoom_group.add(pad_instance.graphical_group);

        objects.splice(line, 0, pad_instance);
        objects.forEach(update_line_number);
    }

    if (changed_line.match(/ElementLine/)) {
        values = parse_elementline(changed_line);
        object_instance = new ElementLine(
                values.x1,
                values.y1,
                values.x2,
                values.y2,
                values.thickness
                );

        console.log("ElementLine added in objects[%d]: %s", line, object_instance);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);

        objects.splice(line, 0, object_instance);
        objects.forEach(update_line_number);
    }
}

function remove_object(line) {

    var changed_line = editor.getLine(line);

    //console.log(objects);
    object_instance = objects[line];
    console.log("Object removed: ", object_instance);
    object_instance.graphical_group.remove();

    objects.splice(line,1);
    objects.forEach(update_line_number);
}

function update_line_number(element, index, array) {
    element.line_number = objects.indexOf(element);
}

function dblclick_handler(e) {
    if (tool_state == "pad") {
        add_pad(e);
    } else if (tool_state == "elementline") {
        add_elementline(e);
    }
}

var tool_state = "pad";

$(document).bind('keydown', 'p', add_pad);
$( "#svg" ).dblclick(dblclick_handler);


var objects = new Array();

objects.push("placeholder");
objects.push("placeholder");

