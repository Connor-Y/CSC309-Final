
$("#rank5").click(function() {
	alert("I rate this 5");
});
$("#rank4").click(function() {
	alert("I rate this 4");
});
$("#rank3").click(function() {
	alert("I rate this 3");
});
$("#rank2").click(function() {
	alert("I rate this 2");
});
$("#rank1").click(function() {
	alert("I rate this 1");
});





$("#rank5").mouseover(function() {
	$(this).css("background-color", "red");
	$("#rank4").css("background-color", "red");
	$("#rank3").css("background-color", "red");
	$("#rank2").css("background-color", "red");
	$("#rank1").css("background-color", "red");
});


$("#rank4").mouseover(function() {
	$(this).css("background-color", "red");

	$("#rank3").css("background-color", "red");
	$("#rank2").css("background-color", "red");
	$("#rank1").css("background-color", "red");
});

$("#rank3").mouseover(function() {
	$(this).css("background-color", "red");
	$("#rank2").css("background-color", "red");
	$("#rank1").css("background-color", "red");
});

$("#rank2").mouseover(function() {
	$(this).css("background-color", "red");
	$("#rank1").css("background-color", "red");
});

$("#rank1").mouseover(function() {
	$(this).css("background-color", "red");
});







$("#rank1").mouseout(function(e) {
  var offset = $(this).offset();
	if (e.pageX < $(this).position().left) {
		$(this).css("background-color", "white");
		$("#rank5").css("background-color", "white");
		$("#rank4").css("background-color", "white");
		$("#rank3").css("background-color", "white");
		$("#rank2").css("background-color", "white");

}
   });
$("#rank2").mouseout(function(e) {
	 var offset = $(this).offset();
	 if (e.pageX < $(this).position().left) {
		$(this).css("background-color", "white");
		$("#rank5").css("background-color", "white");
		$("#rank4").css("background-color", "white");

		$("#rank3").css("background-color", "white");
	 }
});

$("#rank3").mouseout(function(e) {
	 var offset = $(this).offset();
	 if (e.pageX < $(this).position().left) {
		$(this).css("background-color", "white");
		$("#rank4").css("background-color", "white");
		$("#rank5").css("background-color", "white");

	 }
});
$("#rank4").mouseout(function(e) {
	 var offset = $(this).offset();
	 if (e.pageX < $(this).position().left) {
		$(this).css("background-color", "white");
		$("#rank5").css("background-color", "white");
	 }
});
$("#rank5").mouseout(function(e) {
  var offset = $(this).offset();
   // alert(e.pageX - offset.left);
 //  alert($(".star").css("background-color"));
//	if ($("#rank1 .star").css("background-color") == "rgb(255, 255, 255)") {
//		alert("ya");
	if (e.pageX < $(this).position().left) {
		$(this).css("background-color", "white");
}//
   });




