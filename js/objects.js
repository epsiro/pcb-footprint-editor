function add_new_object(line) {

    var changed_line = editor.getLine(line);

    if (changed_line.match(/Pad/)) {
        values = parse_pad_line(changed_line);
        pad_instance = new Pad(line, line,
                mm_to_nm(values.x1),
                mm_to_nm(values.y1),
                mm_to_nm(values.x2),
                mm_to_nm(values.y2),
                mm_to_nm(values.thickness)
                );

        console.log("Pad added: ", pad_instance);
        pad_instance.draw();
        zoom_group.add(pad_instance.pad_group);
        objects.push(pad_instance);
    }
}

function remove_object(line) {

    var changed_line = editor.getLine(line);

    //console.log(objects);
    pad_instance = objects[line];
    console.log("Pad removed: ", pad_instance);
    pad_instance.pad_group.remove();
    objects.splice(line,1);
}

var objects = new Array();

objects.push("placeholder");
objects.push("placeholder");

