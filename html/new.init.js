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
  if (window.matchMedia('(max-width: 767px)').matches) {3
    $.fn.DataTable.ext.pager.numbers_length = 5;
    if (navigator.userAgent.search(/mobile/gi) < 0) {
      $(":root").css("font-size", "100%");
    } else {
      $(":root").css("font-size", "4.17vw");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    $(":root").css("font-size", "2.23vh");
  }
}
$(function() {
  layout();
  $('<small>Last updated on ' + moment().subtract(1, 'days').format('YYYY-MM-DD') + ' UTC. Total records: '+ 
  $( ".release_info>tbody>tr" ).length+'. </small>').appendTo('#date');
  $('#datepicker').val(thisweek);
  $('#datepicker').dtDateTime({
    buttons: {
      // today: true,  clear: true
    },
  });
  $('.release_info').DataTable({
    deferRender: true,
    autoFill: true,
    stateSave: true,
    stateDuration: 60 * 60 * 6,
    stateSaveParams: function(settings, data) {
      data.order = [
        [8, 'asc']
      ];
    },
    order: [
      [8, 'asc']
    ],
    lengthMenu: [50, 100, 200, 400],
    columnDefs: [
      {
        //rendering cover
        render: (data, type, row) => {
          if (type === 'display') {
            return ('<img src="https://www.metal-archives.com'.concat(data.toString(), '" loading="lazy">'));
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
            data.split('.*').forEach(item => (album_col += "<div class='grid_item'>" + "<div class='flex_item'>" + "<a class='hreftext'>" + 
			item.match(hreftext).toString().replace(/\/(?=.{11,})/g, '/<br>')
			.replace(/((?<=[,:\.])\s((?=\D{9,})|(?=\w{5,}))|(\s(?=\w\W\w\W)))/g, '<br>')
			.replace(/\s(?=[(])/g, ' <br>').replace(/\//g, '/<wbr>') + '</a>' + 
			"<div class='dropdown'>" + maLink(item) + '<hr>' + 
			searchLink(item).replace(/\/spotify\"/g, '/albums"') + '</div></div></div>'));
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
        //duration
        render: function(data, type, row) {
          if (type === 'display') {
            switch (data) {
              case 'NA':
                data = "<i class='ts'>no data</i>";
                break;
            }
            return row[6] + " <br><p class='extra'>(" + data + ')</p>';
          }
          return data;
        },
        width: '8%',
        targets: [7],
    },
      {
        // date
        render: (data, type, row) => {
          if (type === 'display') {
            let earlydate = row[9];
            switch (earlydate) {
              case 'NA':
                earlydate = "<i class='ts'>(unknown)</i>";
                break;
              default:
                earlydate = '(' + earlydate + ')';
            }
            return data + "<br><p class='extra'>" + earlydate + '</p>';
          }
          return data;
        },
        width: '8%',
        targets: [8],
    },
      {
        "searchable": false,
        "targets": [4]
    }],
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
    $('.release_info,#date').animate({
      height: 'toggle',
      opacity: 'toggle',
    }, 'slow');
  }, 2500);
  let table = $('.release_info').DataTable();
  table.columns([6, -1]).visible(false);
  // table.columns(  ).visible( true );
  $(table.column(-3).header()).text('Type');
  $(table.column(4).header()).text('Asso. Acts');
  // $("<br><small>(duration)</small>").appendTo( $(table.column( -3 ).header()) );
  $('.release_info tbody').on('dblclick', 'tr', function() {
    $(this).toggleClass('selected');
  });
  $('.release_info tbody').on('click', '.dropdown,.float', function() {
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
  $('.release_info').DataTable().columns().search('').draw();
  $('.release_info').DataTable().column(8).order('asc').draw(true);
});
$(document).on('click', '#all', function() {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val('');
  $('.release_info').DataTable().columns().search('').draw();
  $('.release_info').DataTable().column(8).order('desc').draw(true);
});
$(document).on('click', '#datecondition', function() {
  if ($(this).val() == 'After') {
    $(this).val('Before');
    $(this).css('text-shadow', '0px 0px 1px #d99');
    $('.release_info').DataTable().column(8).order('desc').draw(true);
  } else {
    $(this).val('After');
    $(this).css('text-shadow', '0px 0px 1px #9b9');
    $('.release_info').DataTable().column(8).order('asc').draw(true);
  }
});
$(document).on('click', '#datepicker, #today, #Today, .dt-datetime-today', function() {
  $('#datepicker').val(thisday);
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#dateclear', function() {
  $('#datepicker').val('');
  $('.release_info').DataTable().draw();
});
$(document).on('click', '#labelclear', function() {
  $('#label-filter option').prop('selected', false);
  $('.release_info').DataTable().columns(5).search('').draw();
});
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
  let genre = data[3].toLowerCase();
  let type = data[6];
  let date = data[8];
  let version = data[9];
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
    ($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && version.indexOf('NA') < 0 && version.indexOf('2021') < 0)) {
    return false;
  }
  return genre.search('('.concat(genres.join('|'), ')')) > -1 && dateset;
  // return true;
});
