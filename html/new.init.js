// let today = new Date();
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
  },
});
let thisday = moment().subtract(0, 'days').format('YYYY-MM-DD');
var thisweek;
if (moment().day() >= 5) {
  thisweek = moment().day(5).subtract(0, 'days').format('YYYY-MM-DD');
} else {
  thisweek = moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
}
const uniq = (value, index, self) => self.indexOf(value) === index && !(value == '' || value == ' ' || value == '/' || value == null);
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const tabLink = q => '' + q.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
const maTarget = q => 'https://www.metal-archives.com' + q.match(hreflink);
const maLink = q => '<a href="' + maTarget(q) + "\">MA Page<i class='fa fa-medium'></i></a>";
const searchLink = q => window.matchMedia('(max-width: 767px)').matches ?
  '<a href="https://bandcamp.com/search?q=' + q.match(hreftext) +
  "\">Bandcamp<i class='fa fa-search'></i></a>" +
  '<a href="https://www.youtube.com/results?search_query=' + q.match(hreftext) +
  "\">Youtube<i class='fa fa-search'></i></a>" +
  '<a href="https://open.spotify.com/search/' + q.match(hreftext).join().replace(/\//g, '') + 
  "\">Spotify<i class='fa fa-search'></i></a>" :
  '<a href="https://bandcamp.com/search?q=' + q.match(hreftext) +
  "\">Bandcamp<i class='fa fa-search'></i></a>" +
  '<a href="https://www.youtube.com/results?search_query=' + q.match(hreftext) +
  "\">Youtube<i class='fa fa-search'></i></a>" +
  '<a href="https://open.spotify.com/search/' + q.match(hreftext).join().replace(/\//g, '') + 
  "/spotify\">Spotify<i class='fa fa-search'></i></a>";
const layout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      $(":root").css("font-size", "");
    } else {
      $(":root").css("font-size", "2.23vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "4.17vw");
  }
}
$(function() {
  layout();
  $('<small>Last updated on ' + $('#footer').text() + ' UTC. Total records: '+ 
  $( ".newlist>tbody>tr" ).length+'. </small>').appendTo('#date');
  $('#datepicker').val(thisweek);
  $('#datepicker').dtDateTime({
    buttons: {
      // today: true,  clear: true
    },
  });
  $('.newlist').DataTable({
    deferRender: true,
    autoFill: true,
    stateSave: false,
    stateDuration: 60 * 60 * 6,
    stateSaveParams: function(settings, data) {
      data.order = [[ 7, 'asc' ], [ 0, 'desc' ]]
    },
    order:[[ 7, 'asc' ], [ 0, 'desc' ]],
    lengthMenu: [50, 100, 200, 400],
    columnDefs: [
      {
        //rendering cover
        render: (data, type, row) => {
          if (type === 'display') {
			let album_id = data.split('|||')[0];
			let album_cover = data.split('|||')[1];
            return ('<img src="https://www.metal-archives.com'.concat(album_cover, '" loading="lazy">'));
          }
          return data;
        },
        searchable: false,
        sorting: false,
        width: '16%',
        targets: [0],
    },
      {
        //rendering album
        render: (data, type, row) => {
          if (type === 'display') {
            let album_col = '';
            let album_title = data.split('|||')[0];
			album_col += "<div class='grid_item'>" + "<div class='flex_item'>" + "<a class='hreftext'>" + 
			album_title.match(hreftext).toString().replace(/\/(?=.{11,})/g, '/<br>')
			.replace(/((?<=[,:\.])\s((?=\D{9,})|(?=\w{5,}))|(\s(?=\w[-\.]\w[-\.])))/g, '<br>')
			.replace(/\s(?=[(])/g, ' <br>').replace(/\//g, '/<wbr>') + '</a>' + 
			"<div class='dropdown'>" + maLink(album_title) + '<hr>' + 
			searchLink(album_title).replace(/\/spotify\"/g, '/albums"') + '</div></div></div>';
            return tabLink("<div class='grid_wrapper'>".concat(album_col, '</div>'));
          }
          return data;
        },
        width: '12%',
        targets: [1],
    },
      {
        //rendering band
        render: (data, type, row) => {
          if (type === 'display') {
            let band = data.split('|||')[0].split(/(?<=\>)\s\/\s(?=\<)/g);
            let country = data.split('|||')[1].split('| || |');
            var band_col = band.map(
              (item, i) => '' + "<div class='grid_item'><div class='flex_item'>" + "<a class='hreftext'>" + 
			  item.match(hreftext) + "</a><br><p class='extra ts'>(" + country[i] + ')</p>' + "<div class='dropdown'>" + 
			  maLink(item) + searchLink(item).replace(/\/spotify\"/g, '/artists"') + '</div></div></div>');
            return tabLink("<div class='grid_wrapper'>".concat(band_col.join(''), '</div>'));
          }
          return data;
        },
        width: '12%',
        targets: [2],
    },
      {
        // genre
        render: (data, type) => {
          if (type === 'display') {
            let genre_col = [];
            data.split(' | ').forEach(item => {
              genre_col.push("<div class='grid_item'><div class='flex_item ts'>" + 
			  item.replace(/(?<=[,])\s/g, ' <wbr>').replace(/\//g, '/<wbr>').replace(/(?<=[;|\),])\s/g, ' <br>') + '</div></div>');
            });
            return tabLink("<div class='grid_wrapper'>".concat(genre_col.join(''), '</div>'));
          }
          return data;
        },
        width: '10%',
        targets: [3],
    },
      {
        // info
        render: (data, type) => {
          if (type === 'display') {
            // let info_row = data.split(/\s\|\|\s(?=\|)|(?<=\|)\s\|\|\s/g);
            let info_row = data.split('||');
            var info = info_row.map(item => item.split('|').filter(uniq) != '' ? 
			"<div class='grid_item ts'><div class='flex_item ts fixed'>" + 
			item.split('|').filter(uniq).sort(() => Math.random() - 0.5).join(', ') + 
			'</div>' + "<div class='flex_item ts fixed float'>" + 
			item.split('|').filter(uniq).sort().join(', ')
			.replace(/href\=\"/g, 'href="https://www.metal-archives.com') + 
			'</div></div>' : 
			"<div class='grid_item ts'><div class='flex_item'>" + 
			"<i class='extra'>(No data)</i></div></div>");
            return tabLink("<div class='grid_wrapper ts'>".concat(info.join(''), '</div>'));
          }
          return data;
        },
        "searchable": false,
        width: '10%',
        targets: [4],
    },
      {
        // label
        render: (data, type) => {
          if (type === 'display') {
            switch (data) {
              case 'NA':
                data = '<i>Independent</i>';
                break;
              default:
                data = "<div class='grid_item'><div class='flex_item'><a class='hreftext'>" + 
				data.match(hreftext) + "</a><div class='dropdown'>" + 
				maLink(data) + '<a href="https://bandcamp.com/search?q=' + 
				data.match(hreftext) + '">Bandcamp<i class=\'fa fa-search\'></i></a><a href="https://www.youtube.com/results?search_query=' + 
				data.match(hreftext) + "\">Youtube<i class='fa fa-search'></i></a></div></div></div>";
            }
            return tabLink(data);
          }
          return data;
        },
        width: '10%',
        targets: [5],
    },
      {
        //duration and type
        render: function(data, type, row) {
          if (type === 'display') {
            let duration = data.split('|||')[0];
            let type = data.split('|||')[1];
            switch (duration) {
              case '00:00:00':
                duration = "<i class='ts'>no data</i>";
                break;
            }
            return type + " <br><p class='extra'>(" + duration + ')</p>';
          }
          return data;
        },
        width: '8%',
        targets: [6],
    },
      {
        // date
        render: (data, type, row) => {
          if (type === 'display') {
            let date = data.split('|||')[0];
            let earlydate = data.split('|||')[1];
            switch (earlydate) {
              case '0000-00-00':
                earlydate = "<i class='ts'>(unknown)</i>";
                break;
              default:
                earlydate = '(' + earlydate + ')';
            }
            return date + "<br><p class='extra'>" + earlydate + '</p>';
          }
          return data;
        },
        width: '8%',
        targets: [7],
    }
	],
	"drawCallback": function ( settings ) {
		//group rows by date or month
			var groupColumn = 7;
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last='';
            api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
              var date = group.match(/^\d.{9}/g).toString();
              if (moment(date).format('YYYY') != moment().format('YYYY')) {
                date = moment(date).format('MMM YYYY');
              } else if (moment(date).format('MM') != moment().format('MM')) {
                date = moment(date).format('MMMM');
} else {
                date = moment(date).format('Do MMM');
}
              if ( last !== date ) {
                      $(rows).eq( i ).before( '<tr class="group ts"><td colspan="3"><td class="ts" colspan="1"> - '+date+' -</td><td colspan="4"></tr>' );
                    last = date;
				}
            } );
        },
    search: {
      // regex: true,
      "smart": true,
    },
    autoWidth: false,
    language: {
      searchPlaceholder: 'Search for albums or bands..',
      search: '_INPUT_',
      info: '( _START_ - _END_ ) / _TOTAL_ ',
      infoEmpty: '0 entry',
      infoFiltered: ' [ Total: _MAX_ ]',
    },
    initComplete: function() {
      // select box for labels
      this.api().columns(5).every(function() {
        var column = this;
        var select = $('<select><option value=""></option></select>')
		.insertBefore('#label-filter #labelclear').on('change', function() {
          var val = $.fn.dataTable.util.escapeRegex($(this).val());
          column.search(val ? '^' + val + '$' : '', true, false).draw();
        });
        column.data().unique().sort().each(function(d, j) {
          select.append('<option value="' + d.match(hreftext) + '">' + d.match(hreftext) + '</option>');
        });
      });
    },
  });
  setTimeout(() => {
    table.draw(false);
    $('.filterSection').css({
      opacity: 0.0,
    }).animate({
      opacity: 1.0,
      height: 'fit-content',
    });
  }, 1000);
  setTimeout(() => {
    table.draw(false);
    $('.dataTables_wrapper').css({
      opacity: 0.0,
    }).animate({
      opacity: 1.0,
    });
  }, 1500);
  setTimeout(() => {
    $('.newlist,#date').animate({
      height: 'toggle',
      opacity: 'toggle',
    }, 'slow');
  }, 2500);
  let table = $('.newlist').DataTable();
  // table.columns([6]).visible(false);
  table.columns(  ).visible( true );
  $(table.column(4).header()).text('Asso. Acts');
  $('<div class="fixed float">FORMAT: <p>Release type<br>(Duration)</p><p>Data incomple.</p><p>SORTING by duration</p></div>')
  .appendTo( $(table.column( -2 ).header()) );
   $('<div class="fixed float">FORMAT: <p>Date of current release<br>(Date of earliest known version)</p><p>SORTING by current date</p></div>')
  .appendTo( $(table.column( -1 ).header()) );
  $('.newlist thead').on( 'click', 'th.sorting ', function () {
        var currentOrder = table.order()[0];
        if ( currentOrder[0] == 7 ) {
            $('.newlist .group').css('display', 'table-row');
        }
        else {
            $('.newlist .group').css('display', 'none');
        }
    } );
  $('.newlist tbody').on('dblclick', 'tr', function() {
    $(this).toggleClass('selected');
  });
  $('.newlist tbody').on('click', '.dropdown,.float', function() {
    $(this).toggleClass('actived');
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
  $('.note>b,.note>a').click(function() {
    $('.note>b i').toggleClass('fa-caret-right fa-caret-down');
    $('.note>a').animate({
      height: 'toggle',
      opacity: 'toggle',
    }, 'fast');
    $('.note>div:not(:nth-last-of-type(0))').animate({
      height: 'toggle',
      opacity: 'toggle',
    }, 'fast');
  });
});
$(window).resize(function() {
  layout();
});
$(document).on('click', '.paginate_button', function() {
  $('body,html').animate({
    scrollTop: $('table thead').offset().top - 5,
  }, 800);
});
$(document).on('click', '#reset, #Reset', function() {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val('');
  $('#Reissue').check();
  $('#genre-options option:not(:eq(2))').check();
  $('#datecondition').val('After');
  $('#datepicker').val(thisweek);
  $('.newlist').DataTable().columns().search('').draw();
  $('.newlist').DataTable().order([[ 7, 'asc' ], [ 0, 'desc' ]]).draw(true);
});
$(document).on('click', '#all', function() {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val('');
  $('.newlist').DataTable().columns().search('').draw();
  $('.newlist').DataTable().order([[ 7, 'desc' ], [ 0, 'desc' ]]).draw(true);
});
$(document).on('click', '#datecondition', function() {
  if ($(this).val() == 'After') {
    $(this).val('Before');
    $(this).css('text-shadow', '0px 0px 1px #d99');
    $('.newlist').DataTable().order([[ 7, 'desc' ], [ 0, 'desc' ]]).draw(true);
  } else {
    $(this).val('After');
    $(this).css('text-shadow', '0px 0px 1px #9b9');
    $('.newlist').DataTable().order([[ 7, 'asc' ], [ 0, 'desc' ]]).draw(true);
  }
});
$(document).on('click', '#datepicker, #today, #Today, .dt-datetime-today', function() {
  $('#datepicker').val(thisday);
  $('.newlist').DataTable().draw();
});
$(document).on('click', '#dateclear', function() {
  $('#datepicker').val('');
  $('.newlist').DataTable().draw();
});
$(document).on('click', '#labelclear', function() {
  $('#label-filter option').prop('selected', false);
  $('.newlist').DataTable().columns(5).search('').draw();
});
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
  let genre = data[3].toLowerCase();
  let type = data[6].split('|||')[1];
  let date = data[7].split('|||')[0];
  let version = data[7].split('|||')[1];
  let genres = $('#genre-options').val() || [];
  var dateset;
  if ($('#datepicker').val()) {
    if ($('#datecondition').val() == 'After') {
      dateset = eval(date >= $('#datepicker').val());
    } else if ($('#datecondition').val() == 'Before') {
      dateset = eval(date < $('#datepicker').val());
    }
  } else {
    dateset = date;
  }
  if (
    ($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && version.indexOf('0000') < 0 && version.indexOf('2021') < 0)) {
    return false;
  }
  return genre.search('('.concat(genres.join('|'), ')')) > -1 && dateset;
  // return true;
});
