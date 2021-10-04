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
const partSort = ((x, y) => {
  var xp = x.toLowerCase(), yp = y.toLowerCase();
  return xp == yp ? 0 :
    xp < yp ? -1 :
      1;
});
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const tabLink = links => '' + links.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
const maTarget = q => 'https://www.metal-archives.com/' + q;
const maLink = (type, link) => '<a href="https://www.metal-archives.com/' + type + link + '"' +
  ">MA Page<i class='fa fa-medium'></i></a>";
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
const pageLayout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      // $(":root").css("font-size", "");
    } else {
      $(":root").css("font-size", "2.23vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "3.97vw");
  }
}
const createFilter = (table, columns) => {
  var input = '<input type="text" class="search"/><span class="clear fa fa-times-circle"></span>';
  input = $(input).on("keyup click", function () {
    var
      iclear = $(this).parent().children(".clear"), ivalue = $(this).parent().children("input");
    if (ivalue.val()) { iclear.show(); }
    if ($(this).filter(".clear").length > 0) { ivalue.val(''); ivalue.focus(); iclear.hide(); }
    table.draw();
  });
  $.fn.dataTable.ext.search.push(function (
    settings, searchData, index, rowData, counter
  ) {
    var val = input.val().toLowerCase();
    for (var i = 0, ien = columns.length; i < ien; i++) {
      if (searchData[columns[i]].toLowerCase().split('|||')[0].indexOf(val) !== -1) {
        return true;
      }
    }
    return false;
  });
  return input;
}

$(function () {
  pageLayout();
  $('#datepicker').val(thisweek);
  $('#datepicker').dtDateTime({ });
  $('.newlist').DataTable({
    // processing: true,
    // serverSide: true,
    dom: 'rt<"bottom"<<"#res.btm"> i<"#del.btm">>p>',
    autoWidth: false,
    fixedHeader: true,
    scrollCollapse: true,
    orderCellsTop: false,
    deferRender: true,
    order: [[8, 'asc'], [0, 'desc']],
    lengthMenu: [50, 100, 200, 400],
    search: { regex: true, smart: true, },
    stateSave: true,
    stateDuration: 60 * 60 * 24 * 7,
    fnStateSave: function (Settings, Data) {
      localStorage.setItem('newList', JSON.stringify(Data));
    },
    fnStateLoad: function (Settings) {
      return JSON.parse(localStorage.getItem('newList'));
    },
    language: {
      searchPlaceholder: 'Search for albums or bands..',
      search: '_INPUT_',
      infoEmpty: ' ',
      info: '( _START_ - _END_ ) / _TOTAL_ ',
      infoFiltered: '\n [ Total: _MAX_ ]',
      lengthMenu: " _MENU_ ",
      paginate: { "first": "First", "last": "Last", "next": "Next", "previous": "Prev" },
      zeroRecords: "No matching records found<br>Set fewer filters and retry?",
      loadingRecords: '<div class="loading"><div></div><div></div><div></div><div></div><div></div><div></div></div> Loading...',
    },
    ajax: {
      url: "release",
      dataFilter: function (data) {
        var json = jQuery.parseJSON(data);
        json.data = json.data.slice(0, -1);
        return JSON.stringify(json);
      },
    },
    columnDefs: [
      {
        //rendering cover
        render: (data, type, row) => {
          if (type === 'display') {
            let album_id = data.split(/(?<=\d)\|\|\|/g)[0];
            let album_cover = data.split(/(?<=\d)\|\|\|/g)[1];
            return ('<img src="https://www.metal-archives.com'.concat(album_cover, '" loading="lazy">'));
          }
          return data;
        },
        // searchable: false,
        sorting: false,
        width: '16%',
        targets: [0],
      },
      {
        // rendering album
        render: (data, type, row) => {
          if (type === 'display') {
            let format = /(.*)\|\|\|(\d+)\|\|\|(.*)/;
            let album_col = '';
            let album_title = data.match(format)[1];
            let album_link = data.match(format)[2];
            let album_type = data.match(format)[3];
            album_col += "<div class='grid_item'>" + "<div class='flex_item'>" + "<a class='hreftext'>" +
              album_title
                .replace(/((?<=\p{L}{4,})[\.​]{2,}|(?<!^)[:;]\s|-\s?(?=\p{Lu}\p{Ll}))/gu, '$1\n')
                .replace(/(([\/\(\\～~]|\d{2,}|(?<=\s)((V|v)o?l|(P|p)a?r?t)\.?\s[\p{Lu}\d]).*)/gu, '\n $1')
                .replace(/(^|^\W+?$)\n+|\n(^.{1,3}$)|(^.{1,3}$)\n?/gm, '$1$2$3')
                .replace(/(\n\s?)+/g, '\n')
              +
              "</a><div class='dropdown'>" +
              maLink("albums/id//", album_link) +
              searchLink(album_title).replace(/\/spotify\"/g, '/albums"') +
              "</div><br><abbr class='extra ts'>(" + album_type + ')</abbr></div></div>';
            return tabLink("<div class='grid_wrapper'>".concat(album_col, '</div>'));
          }
          return data;
        },
        width: '11%',
        targets: [1],
      },
      {
        //rendering band
        render: (data, type, row) => {
          if (type === 'display') {
            let
              format = /(.*)\|\|\|(\d[\d\s\/\|]*\d?)\|\|\|(.*)/,
              band_name = data.match(format)[1].split(/\s[\/\|]\s/g),
              band_link = data.match(format)[2].split(/\s[\/\|]\s/g),
              country = data.match(format)[3].split('| || |');
            var band_col = band_name.map((item, i) =>
              '' + "<div class='grid_item'><div class='flex_item'>" + "<a class='hreftext'>" +
              item + "</a><div class='dropdown'>" +
              maLink("bands/id/", band_link[i]) + searchLink(item).replace(/\/spotify\"/g, '/artists"') +
              "</div><br><abbr class='extra ts'>(" + country[i] + ')</abbr></div></div>');
            return tabLink("<div class='grid_wrapper'>".concat(band_col.join(''), '</div>'));
          }
          return data;
        },
        width: '11%',
        targets: [2],
      },
      {
        // genre
        render: (data, type) => {
          if (type === 'display') {
            let genre_col = [];
            data.split(' | ').forEach(item => {
              var genre = item
                .replace(/\/(?!Rock|.*?Metal)/g, ', \n')
                .replace(/(\S+(\/\S+)+)/g, '\n$1\n')
                .replace(/(?<=[;])\s/g, ' <br>')
                .replace(/(?<=[|\),])\s|\s(?=[\(])/g, ' \n')
                .replace(/(?<=br\>|\n\s?)\n|^\n|(?<=\([^\)]*)\n/g, '')
                .replace(/\//g, '/<wbr>')
                ;
              genre_col.push("<div class='grid_item'><div class='flex_item ts'>" +
                genre + '</div></div>');
            });
            return tabLink("<div class='grid_wrapper'>".concat(genre_col.join(''), '</div>'));
          }
          return data;
        },
        sorting: false,
        width: '11%',
        targets: [3],
      },
      {
        // asso
        render: (data, type) => {
          if (type === 'display') {
            let
              info_row = data.split('||'),
              format = /(\d+)['"](.*)/;
            var info = info_row.map(item => {
              var rows = "<div class='grid_item ts'><div class='flex_item ts fixed'>";
              rows += item.split('|').filter(uniq) != '' ?
                item.split('|').filter(uniq).sort(() => Math.random() - 0.5).map(text => text.match(format)[2]).join(', ') +
                '</div>' + "<div class='flex_item ts fixed float'>" +
                item.split('|').filter(uniq).map(link => {
                  return '<a href="https://www.metal-archives.com/bands/view/' +
                    link.match(format)[1] + '">' +
                    link.match(format)[2] + '</a>';
                }).sort((x, y) => {
                  var xp = x.toLowerCase().match(format)[2], yp = y.toLowerCase().match(format)[2];
                  return xp == yp ? 0 : xp < yp ? -1 : 1;
                }).join(', ') :
                "<i class='extra'>(No data)</i>";
              rows += '</div></div>';
              return rows;
            });
            return tabLink("<div class='grid_wrapper ts'>".concat(info.join(''), '</div>'));
          }
          return data;
        },
        searchable: false,
        sorting: false,
        width: '10%',
        targets: [4],
      },
      {
        // Similar 
        render: (data, type) => {
          if (type === 'display') {
            let
              info_row = data.split('||'),
              format = /(\d+)['"](.*)/;
            var info = info_row.map(item => {
              var rows = "<div class='grid_item ts'><div class='flex_item ts fixed'>";
              rows += item.split('|').filter(uniq) != '' ?
                item.split('|').filter(uniq).map(text => text.match(format)[2]).join(', ') +
                '</div>' + "<div class='flex_item ts fixed float'>" +
                item.split('|').filter(uniq).map(link => {
                  return '<a href="https://www.metal-archives.com/bands/view/' +
                    link.match(format)[1] + '">' +
                    link.match(format)[2] + '</a>';
                }).join(', ') :
                "<i class='extra'>(No data)</i>";
              rows += '</div></div>';
              return rows;
            });
            return tabLink("<div class='grid_wrapper ts'>".concat(info.join(''), '</div>'));
          }
          return data;
        },
        searchable: false,
        sorting: false,
        width: '10%',
        targets: [5],
      },
      {
        // label
        render: (data, type) => {
          if (type === 'display') {
            switch (data) {
              case '':
                data = "<i class='ts extra'>Independent</i>";
                break;
              default:
                var
                  format = /(\d+)'(.*)/,
                  labeltext = data.match(format)[2];
                data = "<div class='grid_item'><div class='flex_item'><a class='hreftext'>" +
                  labeltext + "</a><div class='dropdown'>" +
                  maLink('labels/id/', data.match(format)[1]) + '<a href="https://bandcamp.com/search?q=' +
                  labeltext + '">Bandcamp<i class=\'fa fa-search\'></i></a><a href="https://www.youtube.com/results?search_query=' +
                  labeltext + "\">Youtube<i class='fa fa-search'></i></a></div></div></div>";
            }
            return tabLink(data);
          }
          return data;
        },
        sorting: false,
        width: '9%',
        targets: [6],
      },
      {
        //duration and type
        render: function (data, type, row) {
          if (type === 'display') {
            let duration = data.split('|||')[0];
            let track = data.split('|||')[1];
            switch (duration) {
              case '00:00:00':
                duration = "<i class='ts extra'>no data</i>";
                break;
            }
            switch (track) {
              case '0':
                track = "";
                break;
              case '1':
                track = " <br><abbr class='extra ts'>- " + track + ' track -</abbr>';
                break;
              default:
                track = " <br><abbr class='extra ts'>- " + track + ' tracks -</abbr>';
            }
            return duration + track;
          }
          return data;
        },
        width: '7%',
        targets: [7],
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
            return date + "<br><abbr class='extra'>" + earlydate + '</abbr>';
          }
          return data;
        },
        width: '8%',
        targets: [8],
      }
    ],
    drawCallback: function (settings) {
      //group rows by date
      var
        groupColumn = 8,
        api = this.api(),
        rows = api.rows({ page: 'current' }).nodes(),
        last = '';
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
            '<td class="ts" colspan="2"> ' + date + '</td>' +
            '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
            '<td colspan="3"></tr>');
          last = date;
        }
      });
    },
    initComplete: function () {
      var api = this.api(), select;
      api.columns([2, 6]).every(function () {
        var column = this;
        $('<select><option value=""></option></select>')
          .insertBefore('.filter-holder.' + this[0] + ' .clear')
          .on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? val + '$' : '', true, false).draw();
          });
      });
      // select box for labels
      api.columns(6).every(function () {
        select = $('.filter-holder.' + this[0] + ' select');
        var lables =
          this.data().unique().filter(v => v != '').map(d => d.match(/(?<=\d')(.*)/)[1]).sort(partSort).each(opval => {
            select.append('<option value="' + opval + '">' + opval + '</option>');
          });
      });
      // select box for countries
      api.columns(2).every(function () {
        select = $('.filter-holder.' + this[0] + ' select');
        var countries =
          this.data().map((d, j) => {
            return d = d.split('|||')[2].split('| || |');
          }).flatten().sort().reduce(function (obj, item) {
            obj[item] = (obj[item] || 0) + 1;
            return obj;
          }, {});
        Object.entries(countries).forEach(entry => {
          const [key, value] = entry;
          select.append('<option value="' + key + '">' + key + ' (' + value + ') ' + '</option>');
        });
      });
      if (localStorage.getItem('NewSelected') != undefined) {
        var selected = localStorage.getItem('NewSelected').split(',').join('|');
        api.columns(0).search('^('.concat(selected, ')'), true).rows({ search: 'applied' }).remove().column(0).search('').draw();
      };
    },
  });
  let table = $('.newlist').DataTable();
  table.on('xhr', function () {
    var json = table.ajax.json();
    //count rows
    if (json) {
      $('.anchor').hide();
      $('.btm').css({ 'display': 'flex' });
      $('.filterWrapper, #searchBox').css({ 'display': 'grid', visibility: 'visible', opacity: .1 }).animate({ opacity: 1, }, 1000);
      $('#update').text('Last updated on: ' + json.lastUpdate + '. ');
      $("#count").text('Total records: ' + json.recordsTotal + '. ');
      $('#info').show().animate({ height: 'linear', opacity: 'easeOutBounce', }, "slow");
    }
  });
  $("#searchInput").append(createFilter(table, ['2', '1']));
  $("#searchInput input.search").attr('placeholder', 'Search for albums or bands..');
  $("#search-fields").on("keyup change", function (e) {
    var
      searchCols = [],
      searchFields = $('#search-fields').val() || [],
      searchInput = $('#searchInput input.search');
    searchValue = searchInput.val();
    $('#search-fields option:selected').each(function () { searchCols.push($(this).text().toLowerCase().concat('s')) });
    searchCols = searchCols.join(', ').replace(/,(?=[^,]*$)/g, ' or');
    searchInput.val('');
    table.columns(1).search('').columns(2).search('').columns(3).search('').columns(6).search('').draw();
    $("#searchInput").empty().append(createFilter(table, searchFields))
      .children('input.search').val(searchValue)
      .attr('placeholder', 'Search for '.concat(searchCols, '..'));
  });
  table.columns().visible(true);
  table.on('click', 'th.sorting ', function () {
    var currentOrder = table.order()[0];
    if (currentOrder[0] == 8) {
      $('table .group').css('display', 'table-row');
    }
    else {
      $('table .group').css('display', 'none');
    }
  });
  table.on('click', '.prev', function () {
    $(this).parent().prevAll('.group').length > 0 ?
      $('html,body').animate({ scrollTop: $(this).parent().prevAll('.group').offset().top - $(".dataTables_filter").height() }, 600) :
      $('html,body').animate({ scrollTop: $(this).parent().offset().top - $(".dataTables_filter").height() }, 600)
  });
  table.on('click', '.next', function () {
    $(this).parent().nextAll('.group').length > 0 ?
      $('html,body').animate({ scrollTop: $(this).parent().nextAll('.group').offset().top - $(".dataTables_filter").height() }, 600) :
      $('html,body').animate({ scrollTop: $(this).parent().nextAll().last().children().last().offset().top - $(".dataTables_filter").height() }, 600)
  });

  table.on('dblclick', 'tr:not(.group)', function () {
    $(this).toggleClass('selected');
  });
  $('#del').click(function () {
    var selected = table.rows('.selected').data().map((d, j) => {
      return d = d[0].split(/(?<=\d)\|\|\|/g)[0];
    }).toArray();
    if (localStorage.getItem('NewSelected') != null) {
      var storedItems = localStorage.getItem('NewSelected').split(',');
      localStorage.setItem('NewSelected', storedItems.concat(selected));
    } else {
      localStorage.setItem('NewSelected', selected);
    }
    table.rows('.selected').remove().draw(false);
  });
  $('#res').click(function () {
    delete localStorage.NewSelected;
    location.reload();
  });

  table.on('click', '.dropdown,.float', function () {
    $(this).toggleClass('actived');
  });
  $('#datecondition').click(function () {
    if ($(this).val() == 'After') {
      $(this).val('Before');
      $(this).css('text-shadow', '0px 0px 1px #d99');
      table.order([[8, 'desc'], [0, 'desc']]).draw(true);
    } else {
      $(this).val('After');
      $(this).css('text-shadow', '0px 0px 1px #9b9');
      table.order([[8, 'asc'], [0, 'desc']]).draw(true);
    }
  });
  $('#datepicker, #today, #Today, .dt-datetime-today').click(function () {
    $('#datepicker').val(thisday);
    table.draw();
  });
  $('.toggle ').click(function () {
    $(this).parent().children('.hideItem').toggle("fast").css('display', 'grid');
    $(this).children('.fa-chevron').toggleClass("fa-chevron-circle-right fa-chevron-circle-down");
    $(this).children('.fa-caret').toggleClass("fa-caret-right fa-caret-down");
  });
  $('.filterSection .clear').click(function () {
    var filters = $(this).parent();
    var cols = filters.attr('class').replace(/.*(?=\d)/g, '');
    filters.children('select').children('option').prop('selected', false);
    filters.children('#datepicker').val('');
    table.columns(cols).search('').draw();
  });
  $('#all, #reset, #Reset').click(function () {
    $('select option').uncheck();
    $('#searchBox option').check();
    $("input[type='checkbox']").uncheck();
    $("input[type='text']").val('');
    table.columns().search('').draw();
    table.order([[8, 'desc'], [0, 'desc']]).draw(true);
  });
  $('#reset, #Reset').click(function () {
    $('#searchBox option:not(:eq(0)):not(:eq(0))').uncheck();
    $('#genre-options option:not(:eq(-1))').check();
    $('#datecondition').val('After');
    $('#datepicker').val(thisweek);
    table.order([[8, 'asc'], [0, 'desc']]).draw(true);
  });
  $('.filter,.genrefilter,.paginate_button, .dataTables_length, .filter-holder,#reset').on("click change", function (e) {
    table.draw();
  });

});
$(window).resize(function () {
  pageLayout();
});
$(document).on('click', '.paginate_button', function () {
  $('body,html').animate({ scrollTop: $('.newlist tbody').offset().top - $(".dataTables_filter").height() - 8, }, 800);
});

$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
  let type = data[1].match(/(.*)\|\|\|(\d+)\|\|\|(.*)/)[3];
  let genre = data[3].toLowerCase();
  let date = data[8].split('|||')[0];
  let version = data[8].split('|||')[1];
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
    ($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && version.indexOf('0000') < 0)) {
    return false;
  }
  return genre.search('('.concat('(', genres.join('|'), ')', ')')) > -1 && dateset;
  // return true;
});

