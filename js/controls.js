$('.status_tooltip').tooltip();
$('button').tooltip();

$('#controls_mode button').on("click", function() {

    $(this).addClass('active').siblings().removeClass('active');

    if ($(this).attr("id") == "controls_new_pad") {
        tool_state = "pad";
    } else if ($(this).attr("id") == "controls_new_elementline") {
        tool_state = "elementline";
    }
});

$("#controls_undo").on("click", function() { editor.undo(); });
$("#controls_redo").on("click", function() { editor.redo(); });

$("#controls_new_component").on("click", new_component);
$("#load_file").on("click", load_file_as_text);
$("#save_file").on("click", save_text_as_file);

$("#status_xy_distance").parent().hide();
