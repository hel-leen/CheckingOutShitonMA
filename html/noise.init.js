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
      $(":root").css("font-size", "2.4vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "3.6vw");
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
    order: [[6, 'desc'], [5, 'desc'], [3, 'asc'], [2, 'asc'], [1, 'asc']],
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
          width: '22%',
          targets: [0],
        },
        {
          render: (data, type, row) => {
            //rendering album
            if (type === 'display') {
			let text = data.match(/(.*\>)(.+?)(?=[<\(])/).slice(-1)[0];
			let type = 
			data.search(/(spotify\:artist)/)>-1 ?  '&type=band_name"':
			 data.search(/(spotify\:album)/)>-1 ?  '&type=album_title"':
			'"';
			
			let dropdown = "<div class='grid_item'><div class='flex_item'>" +data+
			"<div class='dropdown ts' style='width:90%;'>" +
              '<a href="https://www.metal-archives.com/search?searchString=' + text + type +  ">Search on MA<i class='fa fa-medium'></i></a>"+
              "</div></div></div>";
              return tabLink(dropdown);
            }
            return data;
          },
          targets: [1,2],
        },
        {
		    render: function (data, type, row) {
          if (type === 'display') {
			let format = /(\d+)\|\|\|(.*)/;
            let genre = data.match(format)[2];
            return genre;
          }
          return data;
        },
          width: '15%',
          targets: [3],
        },
        {
          width: '10%',
          targets: [4],
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
          targets: [6],
        },

        {width: '20%', targets: [1],},
        {width: '18%', targets: [2],},
        {width: '5%',visible:false, targets: [5]},
	],
    drawCallback: function (settings) {
      //group rows by date
      var
        groupColumn = 6,
        api = this.api(),
        rows = api.rows({ page: 'current' }).nodes(),
        last = '';
      api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
        var date = moment(group, "YYYYMMDD").format('Do MMM, YYYY');
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
    initComplete: function () {
      var api = this.api(), select;
      api.columns([3]).every(function () {
        var column = this;
        $('<select><option value=""></option></select>')
          .insertBefore('.filter-holder.' + this[0] + ' .clear')
          .on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? val + '$' : '', true, false).draw();
          });
      });
      // select box for labels
      api.columns(3).every(function () {
        select = $('.filter-holder.' + this[0] + ' select');
        var genres =
          this.data().unique().filter(v => v != '').map(d => d.match(/(\d+)\|\|\|(.*)/)[2]).sort(partSort).each(opval => {
            select.append('<option value="' + opval + '">' + opval + '</option>');
          });
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
    table.columns(1).search('').columns(2).search('').columns(3).search('').draw();
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
  $('#reset').click(function () {
    $('.filter-holder.4 select option').prop("selected", true);
    $('.filter-holder.3 select option').prop("selected", false);
    table.draw();
  });
  $('.paginate_button, .dataTables_length,.filterSection, .filter-holder,#reset').on("click change", function (e) {
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
    let
      type = data[4],
      types = $(".filter-holder.4 select").val() || [];

  return type.search('('.concat('(', types.join('|'), ')', ')')) > -1 ;
  // return true;
});
