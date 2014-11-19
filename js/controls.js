$('.status_tooltip').tooltip();
$('a').tooltip();
$('button').tooltip();

$('#controls_mode button').on("click", function() {

    $(this).addClass('active').siblings().removeClass('active');

    if ($(this).attr("id") == "controls_new_pad") {
        tool_state = "pad";
    } else if ($(this).attr("id") == "controls_new_elementline") {
        tool_state = "elementline";
    } else if ($(this).attr("id") == "controls_new_pin") {
        tool_state = "pin";
    }
});

$("#controls_soldermask").on("click", function() {

    if ($(this).hasClass('active') ) {
        $(this).removeClass('active');
        solderstop.attr({ fill: "none" });
    } else {
        $(this).addClass('active');
        solderstop.attr({ fill: "green" });
    }
});

$("#controls_copperplane").on("click", function() {

    if ($(this).hasClass('active') ) {
        $(this).removeClass('active');
        copperplane.attr({ fill: "none" });
    } else {
        $(this).addClass('active');
        copperplane.attr({ fill: "#8c96a0" });
    }
});

$("#controls_undo").on("click", function() { editor.undo(); });
$("#controls_redo").on("click", function() { editor.redo(); });

$("#controls_new_component").on("click", new_component);
$("#load_file").on("click", function() { $("#file_to_load").click(); });
$("#file_to_load").on("change", load_file_as_text);
$("#save_file").on("click", save_text_as_file);

$("#status_xy_distance").hide();

$("#controls_load_component_from_lib").on("click", get_url_and_list_folders_from_lib);
$("ul#gedalib").on("click", "a.folder", list_components_in_folder);
$("ul#gedalib").on("click", "a.file", load_component_from_folder);
