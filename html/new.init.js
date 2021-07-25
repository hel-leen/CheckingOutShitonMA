// let today = new Date();
let today = moment().subtract(0, 'days').format('YYYY-MM-DD');
var thisweek;
if (moment().day() >= 5) {
  thisweek = moment().day(5).subtract(0, 'days').format('YYYY-MM-DD');
} else {
  thisweek = moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
}
// today. setHours(new Date().getUTCHours()- 36);  
console.log(moment().day());

function layoutFunction() {
  if (($(window).width()) < 800) {
    // $( "tr>td, tr>#tableHTML_header_1" ).wrap( "<div class='new'></div>");  
    // $("<h3>Sorting by release date</h3>").insertBefore("#tableHTML_header_1:nth-child(1)");
    $.fn.DataTable.ext.pager.numbers_length = 5;
  } else {
    // $( ".new>td" ).unwrap();  
    // $("h3").remove();
  }
}
$(function() {
  $("<small>Last updated on " + moment().subtract(1, 'days').format('YYYY-MM-DD') + " UTC.</small>").appendTo("#date");
  $("#datepicker").val(thisweek);
  $('#datepicker').dtDateTime();
  $('.release_info').DataTable({
    stateSave: true,
    "stateDuration": 60 * 60 * 6,
    "stateSaveParams": function(settings, data) {
      data.order = [
        [7, "asc"]
      ];
    },
    "order": [[ 7, "asc" ]],  
    "lengthMenu": [50, 100, 200, 400, "All"],
    "columnDefs": [{
        "targets": [0],
        "searchable": false,
        "sorting": false
      },
      {
        render: function(data, type) {
          if (type === 'display') {
            switch (data) {
              case 'NA':
                data = 'Unknown	';
                break;
            }
            return data;
          }
          return data;
        },
        "targets": [8, 6]
      },
      {
        render: function(data, type) {
          if (type === 'display') {
            switch (data) {
              case 'NA':
                data = 'Independent';
                break;
				default:
				data = '<div class="ddd"><div> ' +
                data + '<div class="dd-cc"><a href="https://bandcamp.com/search?q=' +
                data + '">Bandcamp</a><a href="https://www.youtube.com/results?search_query=' +
                data+ '">Youtube</a></div></div></div>'
            }
            return data;
          }
          return data;
        },
        "targets": [4]
      },
      {
        render: function(data, type) {
          if (type === 'display') {
            let genre_col = [];
            data.split(" | ").forEach(function(item) {
              genre_col.push( '<div class="ddd"> ' +
                item.replace(/(?<=[,;])\s/g," \n") + '</div>');
            });
            return  '<div class="grid_wrapper">'.concat(genre_col.join(''),'</div>');
          }
          return data;
        },
        "targets": [3]
      },
      {
        render: function(data, type) {//rendering band
          if (type === 'display') {
            let band_col = [];
            data.split(" / ").forEach(function(item) {
              band_col.push( '<div class="ddd"><div class="dddd"> ' +
                item + '<div class="dd-cc"><a href="https://bandcamp.com/search?q=' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g)+ '">Bandcamp</a><a href="https://www.youtube.com/results?search_query=' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g) + '">Youtube</a><a href="https://open.spotify.com/search/' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g) + '/artists">Spotify</a></div></div></div>');
            });
            return  '<div class="grid_wrapper">'.concat(band_col.join(''),'</div>');
          }
          return data;
        },
        "targets": [2]
      },
      {
        render: function(data, type) { //rendering albums
          if (type === 'display') {
            let album_col = "";
            data.split(".*").forEach(function(item) {
              album_col += '<div class="ddd"><div class="dddd"> ' +
                item.replace(/(?<=[,:\.])\s/g,"<br>").replace(/\s(?=[(])/g," <br>") + '<div class="dd-cc"><a href="https://bandcamp.com/search?q=' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g) + '">Bandcamp</a><a href="https://www.youtube.com/results?search_query=' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g) + '">Youtube</a><a href="https://open.spotify.com/search/' +
                item.match(/(?<=\>).*(?=\<\/a\>)/g) + '/albums">Spotify</a></div></div></div>' + "";
            });
            return  '<div class="grid_wrapper">'.concat(album_col,'</div>');
          }
          return data;
        },
        "targets": [1]
      },
      // {
        // "render": function ( data, type, row )  { //rendering albums
		 // let album_col = [];
            // data.split(" / ").forEach(function(item) {
              // album_col.push( '<div class="ddd"><div class="dddd"> ' +
                // item + '<div class="dd-cc"><a href="https://bandcamp.com/search?q=' +
                // item.match(/(?<=\>).*(?=\<\/a\>)/g)+ '">Bandcamp</a><a href="https://www.youtube.com/results?search_query=' +
                // item.match(/(?<=\>).*(?=\<\/a\>)/g) + '">Youtube</a><a href="https://open.spotify.com/search/' +
                // item.match(/(?<=\>).*(?=\<\/a\>)/g) + '/artists">Spotify</a></div></div></div>');
            // });
			// let genre_col = [];
			// row[3].split(" | ").forEach(function(item) {
				// genre_col.push( '<div class="genre_col">' +item +'</div>');
			// });
			
			// comb_col = album_col.map((e, i) => e + genre_col[i])
            // return '<div class="grid_wrapper">'.concat(comb_col.join(''),'</div>');
          // return data;
        // },
        // "targets": [2]
      // },
	  // { "visible": false,  "targets": [ 3 ] }



    ],
    "search": {
      "regex": true
    },
    "autoWidth": false,
    language: {
      searchPlaceholder: "Search for albums or bands..",
      search: "_INPUT_",
      info: "( _START_ - _END_ ) / _TOTAL_ ",
      infoEmpty: "0 entry",
      infoFiltered: " [ Total: _MAX_ ]"
    },
		initComplete: function () {
			this.api().columns(4).every( function () {
				var column = this;
				var select = $('<select><option value=""></option></select>')
					.insertBefore("#label-filter #labelclear")
					.on( 'change', function () {
						var val = $.fn.dataTable.util.escapeRegex(
							$(this).val()
						);
						column
							.search( val ? '^'+val+'$' : '', true, false )
							.draw();
					} );
				column.data().unique().sort().each( function ( d, j ) {
					select.append( '<option value="'+d+'">'+d+'</option>' )
				} );
			} );
		}
  });
  setTimeout(function() {
    table.draw(false);
    $('.filterSection').css({
      opacity: 0.0
    }).animate({
      opacity: 1.0,
      "height": "fit-content"
    });
  }, 1000);
  setTimeout(function() {
    table.draw(false);
    $('.dataTables_wrapper').css({
      opacity: 0.0
    }).animate({
      opacity: 1.0
    });
  }, 1500);
  setTimeout(function() {
    $('.release_info,#date').animate({
      height: "toggle",
      opacity: "toggle"
    }, "slow");
  }, 2500);
  if (($(window).width()) < 800) {
    $.fn.DataTable.ext.pager.numbers_length = 5;
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 15;
  }
  let table = $('.release_info').DataTable();
  $('.release_info tbody').on('dblclick', 'tr', function() {
    $(this).toggleClass('selected');
  });
  $('#delete_button').click(function() {
    table.rows('.selected').remove().draw(false);
  });
  $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function() {
    table.draw();
  });
  $(".note>b,.note>a").click(function() {
    $(".note>b i").toggleClass("fa-caret-right fa-caret-down");
    $(".note>a").animate({
      height: "toggle",
      opacity: "toggle"
    }, "fast");
    $(".note>div:not(:nth-last-of-type(0))").animate({
      height: "toggle",
      opacity: "toggle"
    }, "fast");
  });
  $(window).resize(function() {
    table.draw(false);
  });
  $('.genrefilter').first().change(function() {
    if ($(this).is(':not(:checked)') && $('.genrefilter').length > 0) {
      alert('I hope you improve your taste');
      $("#black").attr("class", "filter");
    }
  });
});
$(document).on('click', '.paginate_button', function() {
  $("body,html").animate({
    scrollTop: $("table thead").offset().top - 5
  }, 800);
});
$(document).on('click', '#reset, #Reset', function() {
  $('#Fulllength').prop('checked', false);
  $('#Reissue').prop('checked', true);
  $('#label-filter option:selected').prop("selected", false);
  $('.release_info').DataTable().columns( 4).search( '').draw();
  $('#genre-options option[value=black]').prop('selected', true);
  $('#genre-options option[value=death]').prop('selected', true);
  $('#genre-options option:eq(2)').prop("selected", false);
  $("#datecondition").val("After");
  $("#datepicker").val(thisweek);
  $('.release_info').DataTable().column('7:visible').order('asc').draw(true);
});
$(document).on('click', '#all', function() {
  $('#Fulllength').prop('checked', false);
  $('#Reissue').prop('checked', false);
  $('#label-filter option:selected').prop("selected", false);
  $('.release_info').DataTable().columns( 4).search( '').draw();
  $('#genre-options option[value=black]').prop('selected', true);
  $('#genre-options option[value=death]').prop('selected', true);
  $('#genre-options option:eq(2)').prop("selected", true);
  $("#datepicker").val("");
  $('.release_info').DataTable().column('7:visible').order('desc').draw(true);
});
$(document).on('click', '#datecondition', function() {
  if ($(this).val() == "After") {
    $(this).val("Before");
    $(this).css("text-shadow", "0px 0px 1px #d99");
    $('.release_info').DataTable().column('7:visible').order('desc').draw(true);
  } else {
    $(this).val("After");
    $(this).css("text-shadow", "0px 0px 1px #9b9");
    $('.release_info').DataTable().column('7:visible').order('asc').draw(true);
  }
});
$(document).on('click', '#today', function() {
  // $(this).animate({opacity: 'toggle'}).animate({ opacity: 'toggle'});  
  $("#datepicker").val(today);
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#dateclear', function() {
  $("#datepicker").val("");
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#labelclear', function() {
	$('#label-filter option:selected').prop("selected", false);
  $('.release_info').DataTable().columns( 4).search( '').draw();
  // $('.release_info').DataTable().draw();
});


$(window).resize(function() {
  layoutFunction();  
})
window.onscroll = (function() {
  if ($(window).width() >= 800) {
    let scrollY = $(window).scrollTop();
    if (scrollY > $(window).height() * 0.4 && $('tr:hover').length > 0) {
      $("#header").css("font-size", "1.5em");
    } else {
      $("#header").css("fontSize", "2em");
    }
  }
});
$.fn.dataTable.ext.search.push(
  function(settings, data, dataIndex) {
    let genre = data[3].toLowerCase();
    let type = data[5];
    let date = data[7];
    let version = data[8];
    let genres = $("#genre-options").val() || [];
    var dateset;
    if ($("#datecondition").val() == "After") {
      dateset = eval(date >= $("#datepicker").val());
    } else {
      dateset = eval(date < $("#datepicker").val());
    }
    if (($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && version.indexOf('NA') < 0)) {
      return false;
    }
    return (genre.search("(".concat(genres.join("|"), ")")) > -1 && dateset);
    // return true;  
  }
);