let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")http.*(?=\"\>)/g);
const maLink = q => '' + '<a href="' + q.match(hreflink) +
  '" target="_blank" rel="noopener noreferrer">MA Page<i class="fa fa-medium"></i></a>';
const searchLink = q => (window.matchMedia("(max-width: 767px)").matches) ? '' +
  '<a href="https://bandcamp.com/search?q=' +
  q.match(hreftext) + '" target="_blank" rel="noopener noreferrer">Bandcamp<i class="fa fa-search"></i></a>' +
  '<a href="https://www.youtube.com/results?search_query=' +
  q.match(hreftext) + '" target="_blank" rel="noopener noreferrer">Youtube<i class="fa fa-search"></i></a>' +
  '<a href="https://open.spotify.com/search/' +
  q.match(hreftext) + '" target="_blank" rel="noopener noreferrer">Spotify<i class="fa fa-search"></i></a>' : '' +
  '<a href="https://bandcamp.com/search?q=' +
  q.match(hreftext) + '" target="_blank" rel="noopener noreferrer">Bandcamp<i class="fa fa-search"></i></a>' +
  '<a href="https://www.youtube.com/results?search_query=' +
  q.match(hreftext) + '" target="_blank" rel="noopener noreferrer">Youtube<i class="fa fa-search"></i></a>' +
  '<a href="https://open.spotify.com/search/' +
  q.match(hreftext) + '/spotify" target="_blank" rel="noopener noreferrer">Spotify<i class="fa fa-search"></i></a>';

jQuery.fn.extend({
  check: function() {
    return this.each(function() {
      this.checked = true;
      this.selected = true;
    });
  },
  uncheck: function() {
    return this.each(function() {
      this.checked = false;
      this.selected = false;
    });
  }
});

$(document).ready(function() {
	window.matchMedia( '(max-width: 767px)' ).matches &&
	navigator.userAgent.search(/mobile/gi) < 0 ?
      $( ":root" ).css( "font-size","100%" ) :
      $( ":root" ).css( "font-size","4.45vw" )
});
$(function() {
  $('.toplist').DataTable({
    stateSave: true,
    "lengthMenu": [10, 20, 50, "All"],
    "search": {
      "regex": true
    },
    "columnDefs": [{
        "targets": [0],
        "searchable": false,
        "sorting": false
      },
	  {
        render: function(data, type) { //rendering album
          if (type === 'display') {
            let band_col = [];
            data.split(" / ").forEach(function(item) {
              band_col.push( '' + 
			  '<div class="grid_item"><div class="flex_item"><a class="hreftext">' +
                item.match(hreftext) + '</a>' +
                '<div class="dropdown">' +
                maLink(item) +
                searchLink(item).replace(/\/spotify\"/g, '/albums"') +
                '</div></div></div>');
            });
            return '<div class="grid_wrapper">'.concat(band_col.join(''), '</div>');
          }
          return data;
        },
        "targets": [1]
      },
	  {
        render: function(data, type) { //rendering band
          if (type === 'display') {
            let band_col = [];
            data.split(" / ").forEach(function(item) {
              band_col.push( '' + 
			  '<div class="grid_item"><div class="flex_item"><a class="hreftext">' +
                item.match(hreftext) + '</a>' +
                '<div class="dropdown">' +
                maLink(item) +
                searchLink(item).replace(/\/spotify\"/g, '/artists"') +
                '</div></div></div>');
            });
            return '<div class="grid_wrapper">'.concat(band_col.join(''), '</div>');
          }
          return data;
        },
        "targets": [2]
      },
	  ],
    language: {
      searchPlaceholder: "Search for albums or bands..",
      search: "_INPUT_",
      info: "( _START_ - _END_ ) / _TOTAL_ ",
      infoEmpty: "0 entry",
      infoFiltered: " [ Total: _MAX_ ]"
    },
  });
  $("#toplist").attr("placeholder", "Search for albums or bands..");
  $("toplist_length").wrap("<div class='main-container'></div>");
  $(".dataTables_filter label input").attr("placeholder", "Search for albums or bands..");
  let table = $('#toplist').DataTable();
  // table.draw(); 
  setTimeout(function() {
    table.draw(false);
    $('.dataTables_wrapper,.filterSection').css({
      opacity: 0.0
    }).animate({
      opacity: 1.0
    });
  }, 1000);
  setTimeout(function() {
    table.draw(false);
    $('#toplist').fadeIn();
  }, 2000);

  $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function() {
    table.draw();
  });
  $('#reset').click(function() {
    $('.filter-holder select option').prop("selected", true);
    table.draw();
  });
  $('#glossary strong').click(function() {
    $('#glossary p').toggle("fast");
    $("#glossary strong i").toggleClass("fa-caret-right fa-caret-down");
  });
  // $('.filter').attr("checked", true);
});
$(document).on('click', 'a.paginate_button', function() {
  $("body,html").animate({
    scrollTop: $("table thead").offset().top - 60
  }, 800);
});
if (($(window).width()) < 768) {
    $.fn.DataTable.ext.pager.numbers_length = 5;
} else {
    $.fn.DataTable.ext.pager.numbers_length = 9;
}
$.fn.dataTable.ext.search.push(
  function(settings, data, dataIndex) {
    let year = Number(data[6].match(/\d{4}/i).toString());
    let genre = data[4].toLowerCase();
    let continent = data[11];
    let genres = $("#genre-options").val() || [];
    let regions = $("#region-options").val() || [];
    let years = $("#year-options").val() || [];
    let yearsMin = [];
    let yearsMax = [];
    years.forEach(function(item) {
      yearsMin.push(Number(item.match(/\d{4}/i)));
    });

    years.forEach(function(item) {
      yearsMax.push(Number(item.match(/\d{4}(?!\D)/gi)));
    });
    var yearMax = yearsMax.some(function(item) {
      return (item > year || item == year);
    });
    var yearMin = yearsMin.some(function(item) {
      return (item < year || item == year);
    });
    return (continent.search("(".concat(regions.join("|"), ")")) > -1 && genre.search("(".concat(genres.join("|"), ")")) > -1 && yearMin && yearMax);
    // return true;
  });
