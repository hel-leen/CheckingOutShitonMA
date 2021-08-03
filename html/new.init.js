// let today = new Date();
let thisday = moment().subtract(0, 'days').format('YYYY-MM-DD');
var thisweek;
if (moment().day() >= 5) {
  thisweek = moment().day(5).subtract(0, 'days').format('YYYY-MM-DD');
} else {
  thisweek = moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
}
const uniq =  (value, index, self)  =>   self.indexOf(value) === index && !(value == '' || value == ' '|| value == '/' || value == null);
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")http.*(?=\"\>)/g);
const tabLink = q => '' + q.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
const maLink = q => '<a href="' + q.match(hreflink) +
  '">MA Page<i class=\'fa fa-medium\'></i></a>';
const searchLink = q => 
  (window.matchMedia("(max-width: 767px)").matches) ? 
  '<a href="https://bandcamp.com/search?q=' +
  q.match(hreftext) + '">Bandcamp<i class=\'fa fa-search\'></i></a>' +
  '<a href="https://www.youtube.com/results?search_query=' +
  q.match(hreftext) + '">Youtube<i class=\'fa fa-search\'></i></a>' +
  '<a href="https://open.spotify.com/search/' +
  q.match(hreftext) + '">Spotify<i class=\'fa fa-search\'></i></a>' 
  :  
  '<a href="https://bandcamp.com/search?q=' +
  q.match(hreftext) + '">Bandcamp<i class=\'fa fa-search\'></i></a>' +
  '<a href="https://www.youtube.com/results?search_query=' +
  q.match(hreftext) + '">Youtube<i class=\'fa fa-search\'></i></a>' +
  '<a href="https://open.spotify.com/search/' +
  q.match(hreftext) + '/spotify">Spotify<i class=\'fa fa-search\'></i></a>';

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
 
$(function() {
  $("<small>Last updated on " + moment().subtract(1, 'days').format('YYYY-MM-DD') + " UTC.</small>").appendTo("#date");
  $("#datepicker").val(thisweek);
  $('#datepicker').dtDateTime(
 {
        buttons: {
            // today: true,  clear: true
        }
    }
  );
  $('.release_info').DataTable({
    "deferRender": true,
	"stateSave": true,
    "stateDuration": 60 * 60 * 6,
    "stateSaveParams": function(settings, data) {
      data.order = [         [8, "asc"]       ];
    },
    "order": [       [8, "asc"]     ],
    "lengthMenu": [50, 100, 200, 400],
    "columnDefs": [{
        "targets": [0],
        "searchable": false,
        "sorting": false,
		"width": "15%",
		// "max-width": "270px",
      },
      {//rendering albums
        render: (data, type, row ) => { 
          if (type === "display") {
            let album_col = '';
            data.split('.*').forEach((item)  => 
              album_col += "<div class='grid_item'>" + 
			  "<div class='flex_item'>" +
			  "<a class='hreftext'>" +
                item.match(hreftext).toString().replace(/(?<=[,:\.])\s/g, '<br>').replace(/\s(?=[(])/g, ' <br>').replace(/\//g, '/<wbr>') + "</a>" +
                "<div class='dropdown'>" +
                maLink(item) + "<hr>" +
                searchLink(item).replace(/\/spotify\'/g, "/albums'") +
                "</div></div></div>"
            );
            return tabLink("<div class='grid_wrapper'>".concat(album_col, "</div>"));
          }
          return data;
        },
		"width": "12%",
        'targets': [1]
      },
      {//rendering band
        render: (data, type,row)  => { 
           if (type === "display")  {
            let band  = data.split('|||')[0].split(/(?<=\>)\s\/\s(?=\<)/g);
			let country = data.split('|||')[1].split('| || |');
            var band_col = band.map((item, i) => '' + 
			"<div class='grid_item'><div class='flex_item'>"+
			"<a class='hreftext'>" +
                item.match(hreftext) + "</a><br><p class='extra ts'>("+ 
				country[i]  + ")</p>" +
                "<div class='dropdown'>" +
                maLink(item) +
                searchLink(item).replace(/\/spotify\'/g, "/artists'") +
                "</div></div></div>" 
				);
            return tabLink("<div class='grid_wrapper'>".concat(band_col.join(""), "</div>"));
          }
          return  data;
        },
		"width": "12%",
        'targets': [2]
      },
      { // info
        render: (data, type)  =>  { 
          if (type === "display") {
            let info_row = data.split(/\s\|\|\s(?=\|)|(?<=\|)\s\|\|\s/g);
            var info = info_row.map((item) => 
			  (item.split('|').filter(uniq) != '') ?
                 "<div class='grid_item ts'><div class='flex_item ts fixed'>" +
                  item.split('|').filter(uniq).sort().join(", ") + "</div>" +
				  "<div class='flex_item ts fixed float'>" +
                  item.split('|').filter(uniq).sort().join(", ") + "</div></div>"
				  :
				   "<div class='grid_item ts'><div class='flex_item'>" +
                  "<i class='extra'>(No data)</i></div></div>"
            );
            return tabLink("<div class='grid_wrapper ts'>".concat(info.join(""), "</div>"));
          }
          return data;
        },
		"width": "10%",
        'targets': [3]
      },
      { // genre
        render:  (data, type)  => {
          if (type === "display") {
            let genre_col = [];
            data.split(' | ').forEach((item) => {
              genre_col.push("<div class='grid_item'><div class='flex_item ts'>" +
                item.replace(/(?<=[,])\s/g, ' <wbr>').replace(/\//g, '/<wbr>').replace(/(?<=[;])\s/g, ' <br>') + "</div></div>");
            });
            return tabLink("<div class='grid_wrapper'>".concat(genre_col.join(""), "</div>"));
          }
          return data;
        },
		"width": "10%",
        'targets': [4]
      },

      { // label
        render: (data, type)  => { 
          if (type === "display") {
            switch (data) {
              case "NA":
                data = "<i>Independent</i>";
                break;
              default:
                data = "<div class='grid_item'><div class='flex_item'><a class='hreftext'>" +
                  data.match(hreftext) + "</a><div class='dropdown'>"+
				  maLink(data) +
				  '<a href="https://bandcamp.com/search?q=' +
                  data.match(hreftext)  + '">Bandcamp<i class=\'fa fa-search\'></i></a><a href="https://www.youtube.com/results?search_query=' +
                  data.match(hreftext)  + '">Youtube<i class=\'fa fa-search\'></i></a></div></div></div>';
            }
            return tabLink(data);
          }
          return data;
        },
		"width": "10%",
        'targets': [5]
      },
     { //duration
        render: function(data, type,row) {
          if (type === 'display') {
            switch (data) {
              case 'NA':
                data = "<i class='ts'>no data</i>";
                break;
            }
            return row[6] +" <br><p class='extra'>("+ data + ")</p>";
          }
          return data;
        },
		"width": "8%",
        "targets": [7]
      },
      { // date
        render: (data, type, row)  =>  {
          if (type === "display") {
			let earlydate = row[9];
            switch (earlydate) {
              case "NA":
                earlydate = "<i class='ts'>(unknown)</i>";
                break;
			  default: earlydate = "("+ earlydate + ")"
            }
            return data+  "<br><p class='extra'>"+ earlydate + "</p>";
          }
          return data;
        },
		"width": "8%",
        'targets': [8]
      },
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
    initComplete: function() {
      this.api().columns(5).every(function() {
        var column = this;
        var select = $('<select><option value=""></option></select>')
          .insertBefore("#label-filter #labelclear")
          .on('change', function() {
            var val = $.fn.dataTable.util.escapeRegex(
              $(this).val()
            );
            column
              .search(val ? '^' + val + '$' : '', true, false)
              .draw();
          });
        column.data().unique().sort().each(function(d, j) {
          select.append('<option value="' + d.match(hreftext)  + '">' + d.match(hreftext)  + '</option>')
        });
      });
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
  table.columns([6,-1]).visible( false );
  // table.columns(  ).visible( true );
  $( table.column( -3 ).header() ).text("Type");
  $( table.column( 3 ).header() ).text("Asso. Acts");
    // $("<br><small>(duration)</small>").appendTo( $(table.column( -3 ).header()) );
    // $("<br><small>(duration)</small>").appendTo( $(table.table().header()) );
  // $( table.column( -3 ).header() ).attr({'colspan':2,});
  // console.log($( table.column( -3 ).header() ).text()	);
  $('.release_info tbody').on('dblclick', 'tr', function() {
    $(this).toggleClass('selected');
  });
  $('#delete_button').click(function() {
    table.rows('.selected').remove().draw(false);
  });
  $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function() {
    table.draw();
  });
  $('.dataTables_length').change(function() {
    table.draw(true);
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
    // table.draw(false);
  });
});
 
$(document).on('click', '.paginate_button', function() {
  $("body,html").animate({
    scrollTop: $("table thead").offset().top - 5}, 800);
});
$(document).on('click', '#reset, #Reset', function() {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val("");
  $('#Reissue').check();
  $('#genre-options option:not(:eq(2))').check();
  $("#datecondition").val("After");
  $("#datepicker").val(thisweek);
  $('.release_info').DataTable().columns(5).search('').draw();
  $('.release_info').DataTable().column(8).order('asc').draw(true);
});
$(document).on('click', '#all', function() {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val("");
  $('.release_info').DataTable().columns(5).search('').draw();
  $('.release_info').DataTable().column(8).order('desc').draw(true);
});
$(document).on('click', '#datecondition', function() {
  if ($(this).val() == "After") {
    $(this).val("Before");
    $(this).css("text-shadow", "0px 0px 1px #d99");
    $('.release_info').DataTable().column(8).order('desc').draw(true);
  } else {
    $(this).val("After");
    $(this).css("text-shadow", "0px 0px 1px #9b9");
    $('.release_info').DataTable().column(8).order('asc').draw(true);
  }
});
$(document).on('click', '#datepicker, #today, #Today, .dt-datetime-today', function() {
  $("#datepicker").val(thisday);
  // $('button.dt-datetime-day[data-year="2021" data-month="6" data-day="31"]').css("text-shadow", "0px 0px 1px #9b9");
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#dateclear', function() {
  $("#datepicker").val("");
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#labelclear', function() {
  $('#label-filter option').prop("selected", false);
  $('.release_info').DataTable().columns(5).search('').draw();
});

$.fn.dataTable.ext.search.push(
  function(settings, data, dataIndex) {
    let genre = data[4].toLowerCase();
    let type = data[6];
    let date = data[8];
    let version = data[9];
    let genres = $("#genre-options").val() || [];
    var dateset;
    if ( $("#datepicker").val() ) {
      if ($("#datecondition").val() == "After") {
        dateset = eval(date >= $("#datepicker").val());
      } else if ($("#datecondition").val() == "Before") {
        dateset = eval(date < $("#datepicker").val());
      }
    } else {
      dateset = date;
    } 
    if (($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && (version.indexOf('NA') < 0 && version.indexOf('2021') < 0))) {
      return false;
    }
    return (genre.search("(".concat(genres.join("|"), ")")) > -1 && dateset);
    // return true;  
  }
);
