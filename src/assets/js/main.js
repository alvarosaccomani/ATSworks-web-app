$(document).ready(function(){

	/*  Exit system buttom */
	$('.btn-exit-system').on('click', function(e){
		e.preventDefault();
		Swal.fire({
			title: 'Are you sure to close the session?',
			text: "You are about to close the session and exit the system",
			type: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, exit!',
			cancelButtonText: 'No, cancel'
		}).then((result) => {
			if (result.value) {
				window.location="index.html";
			}
		});
	});
});
(function($){
    $(window).on("load",function(){
        $(".nav-lateral-content").mCustomScrollbar({
        	theme:"light-thin",
        	scrollbarPosition: "inside",
        	autoHideScrollbar: true,
        	scrollButtons: {enable: true}
        });
        $(".page-content").mCustomScrollbar({
        	theme:"dark-thin",
        	scrollbarPosition: "inside",
        	autoHideScrollbar: true,
        	scrollButtons: {enable: true}
        });
    });
})(jQuery);