document.addEventListener("DOMContentLoaded", function () {
  var uid = uid();
  var notes_textarea = $("#notes_textarea");
  var done_notes = $("#done_notes");
  var socket = io.connect();
  let room_id = window.location.pathname;
  room_id = room_id.split("/")[3];
  // done_notes.prop("disabled", true);
  socket.emit("join-notes", room_id);
  socket.on("startup", function (data) {
    notes_textarea.val(data.notes);
  });


  notes_textarea.keyup(function () {
    socket.emit("notes_content", { notes: $(this).val(), uid: uid });
  });

  socket.on("notes_content", function (data) {
    if (data.uid != uid) {
      notes_textarea.val(data.notes);
    }
  });

  window.onbeforeunload = function () {
    //before leaving if you are writing or nobody else is writing free notes
    if (notes_textarea.prop("disabled") == false) socket.emit("notes_free");
  };

  function uid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }
});
