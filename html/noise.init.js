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
const pageLayout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      $(":root").css("font-size", "");
    } else {
      $(":root").css("font-size", "2.22vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "3.6vw");
  }
}

String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/\S*?\b[\p{L}']+/gu, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
      function(txt) {
        return txt.toLowerCase();
      });
  uppers =['usbm'];
  var numbers= this.match(/((?<=\b)M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})(?=\b))/gi);
  if (numbers!=null) {
	  numbers=numbers.filter(v => v != '');
  uppers=uppers.concat(numbers);
  }
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'gi'), 
      uppers[i].toUpperCase());
  return str;
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
      if (searchData[columns[i]].toLowerCase().split('|||')[1].indexOf(val) !== -1) {
        return true;
      }
    }
    return false;
  });
  return input;
}

$(function () {
  pageLayout();
  $('.noise').DataTable({
    dom: 'rt<"bottom"<<"#res.btm"> i<"#del.btm">>p>',
    autoWidth: false,
    fixedHeader: true,
    scrollCollapse: true,
    orderCellsTop: false,
    deferRender: true,
    lengthMenu: [150, 300, 600],
    order: [[7, 'desc'], [5, 'asc'], [6, 'asc']],
    search: { regex: true, smart: true, },
    stateSave: true,
    stateDuration: 60 * 60 * 24 * 7,
    stateSaveParams: function (settings, data) {
      data.order = [[7, 'desc'], [5, 'asc'], [6, 'asc']];
    },
    fnStateSave: function (Settings, Data) {
      localStorage.setItem('noiseNoir', JSON.stringify(Data));
    },
    fnStateLoad: function (Settings) {
      return JSON.parse(localStorage.getItem('noiseNoir'));
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
      url: "noise",
      dataFilter: function (data) {
        var json = jQuery.parseJSON(data);
        json.data = json.data.slice(0, -1);
        return JSON.stringify(json);
      },
    },
      "columnDefs": [
        {
          render: (data, type, row) => {
            //rendering cover
            if (type === 'display') {
              return (' <img class=".cover" src="'
                .concat('https://i.scdn.co/image/',data, '" loading="lazy" ></div>'));
            }
            return data;
          },
          searchable: false,
          sorting: false,
          width: '16%',
          targets: [0],
        },
        {
          render: (data, type, row) => {
            //rendering album
            if (type === 'display') {
			let 
			format = /([^:]*?\:[^|]+)\|\|\|(.*)/,
			href = data.match(format)[1],
			text = data.match(format)[2].toTitleCase(),
			type = 
			data.search(/(artist\:)/)>-1 ?  '&type=band_name"':
			 data.search(/(album\:)/)>-1 ?  '&type=album_title"':
			'"';
			text =
			data.search(/(artist\:)/)>-1 ? text:
			text
				.replace(/((?<=\p{L}{4,})[\.​]{2,}|(?<!^)[:;]\s|-\s?(?=\p{Lu}\p{Ll}))/gu, '$1\n')
                .replace(/(([\/\(\\～~]|\d{2,}|(?<=\s)((V|v)o?l|(P|p)a?r?t)\.?\s[\p{Lu}\d]).*)/gu, '\n $1')
                .replace(/(^|^\W+?$)\n+|\n(^.{1,3}$)|(^.{1,3}$)\n?/gm, '$1$2$3')
                .replace(/(\n\s?)+/g, '\n');
			
			let dropdown = "<div class='grid_item'><div class='flex_item'>" + 
			"<a class='hreftext'>"+ text
				 + '</a>'+
			"<div class='dropdown ts' style='width:90%;'>" +
				"<a href='spotify:"+href +
				"'>Open in Spotify<i class='fa fa-spotify'></i></a>"+
              '<a href="https://www.metal-archives.com/search?searchString=' + text.replace(/\s?\(.*?\)/g,'') + type +  
			  ">Search on MA<i class='fa fa-medium ts'></i></a>"+
              "</div></div></div>";
              return tabLink(dropdown);
            }
            return data;
          },
		  width: '15%',
          targets: [1,2],
        },
        {
		    render: function (data, type, row) {
          if (type === 'display') {
			let format = /(\d+)\|\|\|(.*)/;
            let genre = data.match(format)[2].toTitleCase();
            return genre;
          }
          return data;
        },
          width: '15%',
          targets: [3],
        },
        {
          width: '8%',
          targets: [4],
        },
        {
          render: (data, type, row) => {
            //rendering cover
            if (type === 'display') {
              return parseFloat( data).toLocaleString(undefined);
            }
            return data;
          },
          width: '8%',
          targets: [6],
        },
        {
          render: (data, type, row) => {
            //rendering date
            if (type === 'display') {
              return (data.slice(0,4).concat('-',data.slice(4,6),'-',data.slice(6)));
            }
            return data;
          },
          width: '10%',
          targets: [7],
        },

        {width: '5%',visible:false, targets: [5]},
	],
    drawCallback: function (settings) {
      //group rows by date
      var
        groupColumn = 7,
        api = this.api(),
        rows = api.rows({ page: 'current' }).nodes(),
        last = '';
      api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
        var date = moment(group, "YYYYMMDD").format('Do MMM, YYYY');
        if (last !== date) {
          $(rows).eq(i).before('<tr class="group"><td colspan="1"></td>' +
            '<td class=\'prev\'><i class=\'fa fa-angle-left\'></i></td>' +
            '<td class="ts" colspan="2"> ' + date + '</td>' +
            '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
            '<td colspan="2"></tr>');
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
       if (localStorage.getItem('NoiseSelected') != undefined) {
        var selected = localStorage.getItem('NoiseSelected').split(',').join('|');
        api.columns(1).search('('.concat(selected, ')'), true).rows({ search: 'applied' }).remove().column(1).search('').draw();
      };
    },
  });
  let table = $('.newlist').DataTable();
  table.columns(5).visible(false);
  // table.columns().visible(true);
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
    table.columns(1).search('').columns(2).search('').columns(3).search('').draw();
    $("#searchInput").empty().append(createFilter(table, searchFields))
      .children('input.search').val(searchValue)
      .attr('placeholder', 'Search for '.concat(searchCols, '..'));
  });
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
      return d = d[1].match(/[^\:]\:([^|]+)\|\|\|(.*)/)[1];
    }).toArray();
    if (localStorage.getItem('NoiseSelected') != null) {
      var storedItems = localStorage.getItem('NoiseSelected').split(',');
      localStorage.setItem('NoiseSelected', storedItems.concat(selected));
    } else {
      localStorage.setItem('NoiseSelected', selected);
    }
    table.rows('.selected').remove().draw(false);
  });

  table.on('click', '.dropdown,.float', function () {
    $(this).toggleClass('actived');
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
    table.columns(3).search('').draw(true);
	delete localStorage.NoiseSelected;
    location.reload();
  });
  $('.paginate_button, .dataTables_length,.filterSection, .filter-holder,#reset').on("click change", function (e) {
    table.draw(false);
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
