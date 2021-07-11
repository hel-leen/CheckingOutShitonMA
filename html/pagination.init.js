$(function(){
    $('#toplist').DataTable( {
	  stateSave: true,
      "lengthMenu": [10, 20, 50, "All"],
      "search": { "regex": true},
    });
    $("#toplist").attr("placeholder", "Search for albums or bands..");
	$( "toplist_length" ).wrap( "<div class='main-container'></div>");
    $(".dataTables_filter label input").attr("placeholder", "Search for albums or bands..");
    let table = $('#toplist').DataTable();
	table.draw(); 
	setTimeout(function(){ table.draw();$('#toplist').fadeIn(); }, 2000);
	// $('#toplist tbody').on( 'dblclick', 'tr', function () {
	  // $(this).toggleClass('selected');
    // } );
    // $('#delete_button').click( function () {
        // table.rows('.selected').remove().draw( false );
    // } );
    $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change( function() {
      table.draw(); 
    });
    $('#reset').click( function () {
        $('.filter-holder select option').prop( "selected", true );
		 table.draw(); 
    } );
  $('.filter').attr("checked", true);
});
$(document).on('click', 'a.paginate_button', function() {
	$("body,html").animate({scrollTop: $("table thead").offset().top-60 }, 800); 
});
$.fn.dataTable.ext.search.push(
  function( settings, data, dataIndex ) {
    let year =  Number(data[7].match(/\d{4}/i).toString()); 
    let genre =  data[5].toLowerCase(); 
    let continent =  data[4]; 
    let genres = $( "#genres" ).val() || [];
    let regions = $( "#regions" ).val() || [];
    let years = $( "#years" ).val() || [];
	let yearsMin = [];
	let yearsMax = [];
	years.forEach(function (item) {
  yearsMin.push(Number( item.match(/\d{4}/i)) ); 
});
	
	years.forEach(function (item) {
  yearsMax.push(Number( item.match(/\d{4}(?!\D)/gi)) );
});
	var yearMax  = yearsMax.some(function  (item) {
  return item > year;
});
	var yearMin  = yearsMin.some(function  (item) {
  return item < year;
});
	return (continent.search("(".concat(regions.join( "|" ),")"))  > -1 && genre.search("(".concat(genres.join( "|" ),")"))  > -1  && yearMin &&yearMax );
    // return true;
  });