jQuery.fn.extend({
  check: function () {
    return this.each(function () {
      this.checked = true;
      this.selected = true;
    });
  },
  uncheck: function () {
    return this.each(function () {
      this.checked = false;
      this.selected = false;
    });
  },
});
let thisday = moment().format('YYYY-MM-DD');
var thisweek = moment().day() >= 5 ?
  moment().day(5).subtract(0, 'days').format('YYYY-MM-DD') :
  moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
const uniq = (value, index, self) => self.indexOf(value) === index && !(value == '' || value == ' ' || value == '/' || value == null);
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const tabLink = links => '' + links.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
const maTarget = q => 'https://www.metal-archives.com/' + q;
const maLink = (type, link) => '<a href="https://www.metal-archives.com/' + type + link + '"' + ">MA Page<i class='fa fa-medium'></i></a>";
const searchLink = text => {
  text = '<a href="https://bandcamp.com/search?q=' + text +
    "\">Bandcamp<i class='fa fa-search'></i></a>" +
    '<a href="https://www.youtube.com/results?search_query=' + text +
    "\">Youtube<i class='fa fa-search'></i></a>" +
    '<a href="https://open.spotify.com/search/' + text.replace(/\//g, '');
  text += window.matchMedia('(max-width: 767px)').matches ?
    '">Spotify<i class="fa fa-search"></i></a>' :
    '/spotify">Spotify<i class="fa fa-search"></i></a>'
  return text;
};
const layout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      // $(":root").css("font-size", "");
    } else {
      $(":root").css("font-size", "2.23vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "4.17vw");
  }
}
$(function () {
  layout();
  $('#date').append('<a>Last updated on ' + $('#footer').text() + ' UTC. ' + '</a>');
  $('#datepicker').val(thisweek);
  $('#datepicker').dtDateTime({
    buttons: {
      // today: true,  clear: true
    },
  });
  $('.newlist').DataTable({
    // processing: true,
    // serverSide: true,
    ajax: {
      url: "release",
      dataSrc: function (json) {
        return json.data.slice(0, -1);
      }
    },
    deferRender: true,
    stateSave: false,
    stateDuration: 60 * 60 * 6,
    stateSaveParams: function (settings, data) {
      data.order = [[7, 'asc'], [0, 'desc']]
    },
    order: [[7, 'asc'], [0, 'desc']],
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
        // rendering album
        render: (data, type, row) => {
          if (type === 'display') {
            let album_col = '';
            let album_title = data.split('|||')[0];
            let album_link = data.split('|||')[1];
            album_col += "<div class='grid_item'>" + "<div class='flex_item'>" + "<a class='hreftext'>" +
              album_title.replace(/\/(?=.{11,})/g, '/<br>')
                .replace(/((?<=[,:\.])\s((?=\D{9,})|(?=\w{5,}))|(\s(?=\w[-\.]\w[-\.])))/g, '<br>')
                .replace(/\s(?=[(])/g, ' <br>').replace(/\//g, '/<wbr>') + '</a>' +
              "<div class='dropdown'>" + maLink("albums", album_link) +
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
            let band = data.split('|||')[0].split(/\s[\/\|]\s/g);
            let bandlink = data.split('|||')[1].split(/\s[\/\|]\s/g);
            let country = data.split('|||')[2].split('| || |');
            var band_col = band.map(
              (item, i) => '' + "<div class='grid_item'><div class='flex_item'>" + "<a class='hreftext'>" +
                item + "</a><br><p class='extra ts'>(" + country[i] + ')</p>' + "<div class='dropdown'>" +
                maLink("bands", bandlink[i]) + searchLink(item).replace(/\/spotify\"/g, '/artists"') + '</div></div></div>');
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
            let info_row = data.split('||');
            var info = info_row.map(item => item.split('|').filter(uniq) != '' ?
              "<div class='grid_item ts'><div class='flex_item ts fixed'>" +
              item.split('|').filter(uniq).sort(() => Math.random() - 0.5).join(', ')
                .replace(/\/\d+\">/g, '') +
              '</div>' + "<div class='flex_item ts fixed float'>" +
              item.split('|').filter(uniq).map(link => {
                return '<a href="https://www.metal-archives.com/bands/' +
                  link.match(/(?<=;).*/g) + "/" +
                  link.match(/(?<=\/)\d+/g) + '">' +
                  link.match(/(?<=>).*/g) + '</a>';
              }
              ).sort().join(', ') +
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
                var labeltext = data.match(/(?<=>).*/g)
                data = "<div class='grid_item'><div class='flex_item'><a class='hreftext'>" +
                  labeltext + "</a><div class='dropdown'>" +
                  maLink('labels/', labeltext.concat(data.match(/\/\d+/g))) + '<a href="https://bandcamp.com/search?q=' +
                  labeltext + '">Bandcamp<i class=\'fa fa-search\'></i></a><a href="https://www.youtube.com/results?search_query=' +
                  labeltext + "\">Youtube<i class='fa fa-search'></i></a></div></div></div>";
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
        render: function (data, type, row) {
          if (type === 'display') {
            let duration = data.split('|||')[0];
            let track = data.split('|||')[1];
            let type = data.split('|||')[2];
            switch (duration) {
              case '00:00:00':
                duration = "<i class='ts'>no data</i>";
                break;
            }
            switch (track) {
              case '0':
                track = "";
                break;
              case '1':
                track = "";
                break;
              default:
                track = " ∙ " + track;
            }
            return type + track + " <br><p class='extra'>(" + duration + ')</p>';
          }
          return data;
        },
        width: '9%',
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
    drawCallback: function (settings) {
      //group rows by date
      var groupColumn = 7;
      var api = this.api();
      var rows = api.rows({ page: 'current' }).nodes();
      var last = '';
      api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
        var date = group.match(/^\d.{9}/g).toString();
        date = (
          moment(date).format('YYYY') != moment().format('YYYY') ? moment(date).format('MMM YYYY') :
            moment(date).format('MM') == moment().format('MM') ? moment(date).format('Do MMM') :
              moment(date).format('MMMM')
        );
        if (last !== date) {
          $(rows).eq(i).before('<tr class="group"><td colspan="2"></td>' +
            '<td class=\'prev\'><i class=\'fa fa-angle-left\'></i></td>' +
            '<td class="ts" colspan="1"> ' + date + '</td>' +
            '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
            '<td colspan="3"></tr>');
          last = date;
        }
      });
	//count rows
	if ( api.data().count() != 0 ) {
   	    $("#count").append('<a>Total records: ' + api.rows().count() + '. </a>');
	}
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
      infoEmpty: 'No data',
      infoFiltered: ' [ Total: _MAX_ ]',
    },
    initComplete: function () {
      // select box for labels
      this.api().columns(5).every(function () {
        var column = this;
        var select = $('<select><option value=""></option></select>')
          .insertBefore('#label-filter #labelclear').on('change', function () {
            $("input[type='checkbox']").uncheck();
            $('#genre-options option').uncheck();
            $('#datepicker').val('');
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? val + '$' : '', true, false).draw();
          });

        column.data().unique().filter(function (v) {
          return v.match(/(?<=>).*/g) != null;
        }
        ).sort((x, y) => {
          var xp = x.match(/(?<=>).*/g).toString().toLowerCase();
          var yp = y.match(/(?<=>).*/g).toString().toLowerCase();
          return xp == yp ? 0 :
            xp < yp ? -1 :
              1;
        }).each((d, j) => {
          var opval = d.match(/(?<=>).*/g);
          select.append('<option value="' + opval + '">' + opval +
            '</option>');
        });

      });
    },
  });
  setTimeout(() => {
    $('#info').animate({
      height: 'toggle',
      opacity: 'toggle',
    }, 'slow');
  }, 0);
  let table = $('.newlist').DataTable();
  // table.columns([6]).visible(false);
  table.columns().visible(true);
  $(table.column(4).header()).text('Asso. Acts');
  $('<div class="fixed float">FORMAT: <p>Release type<br>(Duration)</p><p>Data incomple.</p><p>SORTING by duration</p></div>')
    .appendTo($(table.column(-2).header()));
  $('<div class="fixed float">FORMAT: <p>Date of current release<br>(Date of earliest known version)</p><p>SORTING by current date</p></div>')
    .appendTo($(table.column(-1).header()));
  $('.newlist thead').on('click', 'th.sorting ', function () {
    var currentOrder = table.order()[0];
    if (currentOrder[0] == 7) {
      $('.newlist .group').css('display', 'table-row');
    }
    else {
      $('.newlist .group').css('display', 'none');
    }
  });
  $('.newlist tbody').on('click', '.prev', function () {
    $(this).parent().prevAll('.group').length > 0 ?
      $('html,body').animate({ scrollTop: $(this).parent().prevAll('.group').offset().top - $(".dataTables_filter").height() }, 600) :
      $('html,body').animate({ scrollTop: $(this).parent().offset().top - $(".dataTables_filter").height() }, 600)
  });
  $('.newlist tbody').on('click', '.next', function () {
    $(this).parent().nextAll('.group').length > 0 ?
      $('html,body').animate({ scrollTop: $(this).parent().nextAll('.group').offset().top - $(".dataTables_filter").height() }, 600) :
      $('html,body').animate({ scrollTop: $(this).parent().nextAll().last().children().last().offset().top - $(".dataTables_filter").height() }, 600)
  });
  $('.newlist tbody').on('dblclick', 'tr:not(.group)', function () {
    $(this).toggleClass('selected');
  });
  $('.newlist tbody').on('click', '.dropdown,.float', function () {
    $(this).toggleClass('actived');
  });
  $('#delete_button').click(function () {
    table.rows('.selected').remove().draw(false);
  });
  $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function () {
    table.draw();
  });
  $('.dataTables_length').change(function () {
    table.draw(true);
  });
  $('.note>b,.note>a').click(function () {
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
$(window).resize(function () {
  layout();
});
$(document).on('click', '.paginate_button', function () {
  $('body,html').animate({ scrollTop: $('.newlist tbody').offset().top - $(".dataTables_filter").height(), }, 800);
});

$(document).on('click', '#reset, #Reset', function () {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val('');
  $('#Reissue').check();
  $('#genre-options option:not(:eq(2))').check();
  $('#datecondition').val('After');
  $('#datepicker').val(thisweek);
  $('.newlist').DataTable().columns().search('').draw();
  $('.newlist').DataTable().order([[7, 'asc'], [0, 'desc']]).draw(true);
});
$(document).on('click', '#all', function () {
  $("input[type='checkbox']").uncheck();
  $('select option').uncheck();
  $("input[type='text']").val('');
  $('.newlist').DataTable().columns().search('').draw();
  $('.newlist').DataTable().order([[7, 'desc'], [0, 'desc']]).draw(true);
});
$(document).on('click', '#datecondition', function () {
  if ($(this).val() == 'After') {
    $(this).val('Before');
    $(this).css('text-shadow', '0px 0px 1px #d99');
    $('.newlist').DataTable().order([[7, 'desc'], [0, 'desc']]).draw(true);
  } else {
    $(this).val('After');
    $(this).css('text-shadow', '0px 0px 1px #9b9');
    $('.newlist').DataTable().order([[7, 'asc'], [0, 'desc']]).draw(true);
  }
});
$(document).on('click', '#datepicker, #today, #Today, .dt-datetime-today', function () {
  $('#datepicker').val(thisday);
  $('.newlist').DataTable().draw();
});
$(document).on('click', '#dateclear', function () {
  $('#datepicker').val('');
  $('.newlist').DataTable().draw();
});
$(document).on('click', '#labelclear', function () {
  $('#label-filter option').prop('selected', false);
  $('.newlist').DataTable().columns(5).search('').draw();
});
$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
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
