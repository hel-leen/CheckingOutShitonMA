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
  var xp = x.toLowerCase();
  var yp = y.toLowerCase();
  return xp == yp ? 0 :
    xp < yp ? -1 :
      1;
});
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g);
let hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const tabLink = links => '' + links.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
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
  $('#datepicker').dtDateTime({
    buttons: {
      // today: true,  clear: true
    },
  });
  $('.noise').DataTable({
    // processing: true,
    // serverSide: true,
    ajax: {
      url: "everynoise",
      dataFilter: function (data) {
        var json = jQuery.parseJSON(data);
        json.data = json.data.slice(0, -1);
        return JSON.stringify(json);
      },
    },
    autoWidth: false,
    fixedHeader: true,
    orderCellsTop: false,
    deferRender: true,
    // stateSave: true,
    stateDuration: 60 * 60 * 6,
    dom: 'rt<"bottom"ip>',
    lengthMenu: [150, 300, 600],
    order: [[5, 'desc'], [3, 'desc']],
    search: {
      regex: true,
      smart: true,
    },
    language: {
      searchPlaceholder: 'Search for albums or bands..',
      search: '_INPUT_',
      infoEmpty: ' ',
      info: '( _START_ - _END_ ) / _TOTAL_ ',
      infoFiltered: ' [ Total: _MAX_ ]',
      lengthMenu: " _MENU_ ",
      paginate: { "first": "First", "last": "Last", "next": "Next", "previous": "Prev" },
      zeroRecords: "No matching records found<br>Set fewer filters and retry?",
      loadingRecords: '<div class="loading"><div></div><div></div><div></div><div></div><div></div><div></div></div> Loading...',
    },
      "columnDefs": [
        {
          render: (data, type, row) => {
            //rendering cover
            if (type === 'display') {
              return ('<img class=".cover" src="'
                .concat(data, '" loading="lazy" >'));
            }
            return data;
          },
          searchable: false,
          sorting: false,
          width: '20%',
          targets: [0],
        },
        {
          render: (data, type, row) => {
            //rendering cover
            if (type === 'display') {
              return (data.slice(0,4).concat('-',data.slice(4,6),'-',data.slice(6)));
            }
            return data;
          },
          width: '10%',
          targets: [5],
        },
        {
          width: '20%',
          targets: [1,2,4],
        },
	],
    drawCallback: function (settings) {
      //group rows by date
      var
        groupColumn = 5,
        api = this.api(),
        rows = api.rows({ page: 'current' }).nodes(),
        last = '';
      api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
        var date = moment(group, "YYYYMMDD");
        date = (
          moment(date).format('YYYY') != moment().format('YYYY') ? moment(date).format('MMM YYYY') :
            moment(date).format('MM') == moment().format('MM') ? moment(date).format('Do MMM') :
              moment(date).format('MMMM')
        );
        if (last !== date) {
          $(rows).eq(i).before('<tr class="group"><td colspan="1"></td>' +
            '<td class=\'prev\'><i class=\'fa fa-angle-left\'></i></td>' +
            '<td class="ts" colspan="1"> ' + date + '</td>' +
            '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
            '<td colspan="3"></tr>');
          last = date;
        }
      });
    },

  });
  let table = $('.newlist').DataTable();
  table.on('xhr', function () {
    var json = table.ajax.json();
    //count rows
    if (json) {
      $('.anchor').hide();
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
  $('#delete_button').click(function () {
    table.rows('.selected').remove().draw(false);
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
});
$(window).resize(function () {
  pageLayout();
});



