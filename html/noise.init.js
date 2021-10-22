const pageLayout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      $(":root").css("font-size", "2.1vh");
    } else {
      $(":root").css("font-size", "2.2vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "3.6vw");
  }
}
$(function() {
  pageLayout();
  $('.dataTables').DataTable({
    dom: 'rt<"bottom"<<"#res.btm"> i<"#del.btm">>p>',
    autoWidth: false,
    fixedHeader: true,
    scrollCollapse: true,
    orderCellsTop: false,
    deferRender: true,
    lengthMenu: [150, 300, 600],
    order: [
      [9, 'desc'],
      [6, 'asc'],
      [5, 'asc']
    ],
    search: {
      regex: true,
      smart: true,
    },
    stateSave: true,
    stateDuration: 60 * 60 * 24 * 7,
    stateSaveParams: function(settings, data) {
      data.order = [
        [9, 'desc'],
        [6, 'asc'],
        [5	, 'asc']
      ];
      data.columns.forEach(item => {
        item.search.search = ''
      });
    },
    fnStateSave: function(Settings, Data) {
      localStorage.setItem(ajaxurl, JSON.stringify(Data));
    },
    fnStateLoad: function(Settings) {
      return JSON.parse(localStorage.getItem(ajaxurl));
    },
    language: {
      searchPlaceholder: 'Search for albums or bands..',
      search: '_INPUT_',
      infoEmpty: ' ',
      info: '( _START_ - _END_ ) / _TOTAL_ ',
      infoFiltered: '\n [ Total: _MAX_ ]',
      lengthMenu: " _MENU_ ",
      paginate: {
        "first": "First",
        "last": "Last",
        "next": "Next",
        "previous": "Prev"
      },
      zeroRecords: "No matching records found<br>Set fewer filters and retry?",
      loadingRecords: '<div class="loading"><div></div><div></div><div></div><div></div><div></div><div></div></div> Loading...',
    },
    ajax: {
      url: ajaxurl,
      dataFilter: function(data) {
        var json = jQuery.parseJSON(data);
        json.data = json.data.slice(0, -1);
        return JSON.stringify(json);
      },
    },
    "columnDefs": [{
      render: (data, type, row) => {
        //rendering cover
        if (type === 'display') {
          return (' <img class="" src="'
            .concat('https://i.scdn.co/image/', data, '" loading="lazy" ></div>'));
        }
        return data;
      },
      searchable: false,
      sorting: false,
      width: '14%',
      targets: [0],
    }, {
      width: '10%',
      targets: [2],
    }, {
      render: (data, type, row) => {
        //rendering album
        if (type === 'display') {
          let
            format = /(.*)\|\|\|((?:artist|album))\:(.*?)/,
            type = data.match(format)[2],
            href = data.match(format)[3],
            text  = data.match(format)[1].toTitleCase(),
            extra = "",
            searchtype =
            type == "artist" ? '&type=band_name"' : '&type=album_title"';
          text =
            type == "artist" ? text :
            text
            .replace(/((?<=\p{L}{4,})[\.​]{2,}|(?<!^)[:;]\s|-\s?(?=\p{Lu}\p{Ll}))/gu, '$1\n')
            .replace(/(([\/\(\\～~]|\d{2,}|(?<=\s)((V|v)o?l|(P|p)a?r?t)\.?\s[\p{Lu}\d]).*)/gu, '\n $1')
            .replace(/(^|^\W+?$)\n+|\n(^.{1,3}$)|(^.{1,3}$)\n?/gm, '$1$2$3')
            .replace(/(\n\s?)+/g, '\n');
          let dropdown = "<div class='grid_item'><div class='flex_item'>" +
            "<a class='hreftext'>" + text + '</a>' +
            "<div class='dropdown ts' style='width:90%;'>" +
            "<a href=\"https://open.spotify.com/" + type + "/" + href +
            "\">Open in Spotify<i class='fa fa-spotify'></i></a>" +
            '<a href="https://www.metal-archives.com/search?searchString=' + text.replace(/\s?\(.*?\)/g, '') + searchtype +
            ">Search on MA<i class='fa fa-medium ts'></i></a>" +
            "</div><br>" + '</div></div>';
          return dropdown;
        }
        return data;
      },
      width: '11%',
      targets: [1, 2],
    }, {
      //genre
      render: function(data, type, row) {
        if (type === 'display') {
          let format = /(\d+)\|\|\|(.*)/;
          let genre = data.replace(/(?<=[,])\s/g, ' \n').toTitleCase();
          return "<div class='ts '><div class='flex_item ts genre'>" +
            genre + '</div></div>';
        }
        return data;
      },
      width: '9%',
      targets: [3],
    }, {
      render: (data, type, row) => {
        // similar
        if (type === 'display') {
          switch (data) {
            case 'NA|||NA':
              data = "<i class='ts extra'>No data</i>";
              break;
            default:
              var 
			   format=/(.*)\|\|\|(.*)/,
               artist = data.match(format)[1].split(/,\s?/g),
               artist_id = data.match(format)[2].split(/,\s?/g),
               floated = artist.map((item, i) => {
                return '<a href="https://open.spotify.com/artist/' +
                  artist_id[i] + '">' + item + '</a>'
              });
              return "<div class='grid_wrapper ts'><div class='grid_item ts'><div class='flex_item ts fixed'>" + 
			  artist.join(',  ').toTitleCase() + "</div><div class='flex_item ts fixed float'>" + floated.join(',  ') + '</div></div></div>';
          }
        }
        return data;
      },
      width: '11%',
      targets: [4],
    }, {
      render: (data, type, row) => {
        //rendering rank
        if (type === 'display') {
          var
          format = /(^ranking:)(\d+)\|\|\|(.*)/,
          followers = parseFloat(data.match(format)[3]).toLocaleString(undefined),
          ranking = parseFloat(data.match(format)[2]).toLocaleString(undefined);
          return '<div class="ts"><abbr style="opacity:.7;">Ranking: </abbr>' + ranking + 
		  '<br><abbr style="opacity:.7;">Listeners: </abbr>' + followers + "</div>";
        }
        return data;
      },
      width: '10%',
	  type: "ranking",
      targets: [5],
    }, {
      render: (data, type, row) => {
        //rendering label
        if (type === 'display') {
           switch (data) {
             case '':
               data = "<i class='ts'>(No data)</i>";
               break;
             default:
			   var
                label =   data.toLowerCase(),
                labelname =  data.search(/(\d+\sRecords DK)/)>-1? '<a class="hreftext" href="https://distrokid.com/">DistroKid</a>':data,
				band = row[2].toLowerCase().match(/(.*)\|\|\|(.*)/)[2];
				data = label.search(band)< 0? labelname: "<i class='ts'>Indepedent</i>"
           }
        }
        return '<div class="ts">' + data+'</div>';
      },
      width: '8%',
      targets: [7],
    }, {
      render: (data, type, row) => {
        //rendering length
        if (type === 'display') {
          var
          format = /(.*)\|\|\|(.*)/,
          type = data.match(format)[2],
          length = data.match(format)[1];
          // type = data;
          return '<div class="ts">' + length + 
		  '<br><abbr class="ts" style="opacity:.6;  color: #fed;">- ' + type + 
		  ' -</abbr></div>';
        }
        return data;
      },
      width: '7%',
      targets: [8],
    },{
      render: (data, type, row) => {
        //rendering date
        if (type === 'display') {
			var format = /(.*)\|\|\|(.*)/;
			return data.match(format)[2];
          // return (data.slice(0, 4).concat('-', data.slice(4, 6), '-', data.slice(6)));
        }
        return data;
      },
      width: '7%',
      targets: [-1],
    }, ],
    drawCallback: function(settings) {
	  $("a").attr({"target": "_blank", "rel":"noopener noreferrer"});
      //group rows by date
      var
        groupColumn = 9,
        api = this.api(),
        rows = api.rows({
          page: 'current'
        }).nodes(),
        last = '';
      api.column(groupColumn, {
        page: 'current'
      }).data().each(function(group, i) {
        var 
		 format = /(.*)\|\|\|(.*)/,
		update= group.match(format)[1]; 
		update = moment(update).format('Do MMM, YYYY');
         if (last !== update) {
           $(rows).eq(i).before('<tr class="group ts"><td colspan="2"></td>' +
             '<td class=\'prev\'><i class=\'fa fa-angle-left\'></i></td>' +
             '<td class="ts" colspan="2"> <abbr style="opacity:.6;  color: #fff;">Updated on: </abbr><br>' + update + '</td>' +
             '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
             '<td colspan="3"></tr>');
           last = update;
         }
      });
	  	      //cancel groups
   $('.dataTables th').on('click',  function() {
     var currentOrder = table.order()[0][0];
     if (currentOrder == groupColumn) {
       $('table tr.group').css('display', 'table-row');
     } else {
       $('table tr.group').css('display', 'none');
     }
   });
    },
    initComplete: function() {
      var api = this.api(),
        select;
      api.columns([3]).every(function() {
        var column = this;
        $('<select><option value=""></option></select>')
          .insertBefore('.filter-holder.' + this[0] + ' .clear')
          .on('change', function() {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            column.search(val ? val + '' : '', true, false).draw();
          });
      });
      // select box for labels
      api.columns(3).every(function() {
        select = $('.filter-holder.' + this[0] + ' select');
        var genres =
          this.data().map((d, j) => {
            return d = d.toTitleCase().split(/,\s?/);
          }).flatten().sort().reduce(function(obj, item) {
            obj[item] = (obj[item] || 0) + 1;
            return obj;
          }, {});
        Object.entries(genres).forEach(entry => {
          const [key, value] = entry;
          select.append('<option value="' + key + '">' + key + ' (' + value + ') ' + '</option>');
        });
      });
      if (localStorage.getItem(deletedItem) != undefined) {
        var selected = localStorage.getItem(deletedItem).split(',').join('|');
        api.columns(1).search('^('.concat(selected, ')'), true).rows({
          search: 'applied'
        }).remove().column(1).search('').draw();
      };
    },
  });
  let table = $('.dataTables').DataTable();
  table.columns([6]).visible(false);
  // table.columns().visible(true);
  table.on('xhr', function() {
    var json = table.ajax.json();
    if (json) {
      $('.anchor').hide();
      $('.filterWrapper, #searchBox, #timecharts, .bottom')
        .removeClass('hideItem')
        .css({
          'display': 'grid',
          visibility: 'visible',
          opacity: .1
        }).animate({
          opacity: 1,
        }, 1000);
      $('#update').text('Last updated on: ' + json.lastUpdate + '. ');
      $("#count").text('Total records: ' + json.recordsTotal + ' ');
      $('#info').show().animate({
        height: 'linear',
        opacity: 'easeOutBounce',
      }, "slow");
    } else {
      $('.bottom').hide();
      $('.anchor').show().css({
        'display': 'flex'
      });
    }
  });
  $("#searchInput").append(createFilter(table, ['2', '1']));
  $("#searchInput input.search").attr('placeholder', 'Search for albums or bands..');
  $("#search-fields").on("keyup change", function(e) {
    var
      searchCols = [],
      searchFields = $('#search-fields').val() || [],
      searchInput = $('#searchInput input.search');
    searchValue = searchInput.val();
    $('#search-fields option:selected').each(function() {
      searchCols.push($(this).text().toLowerCase().concat('s'))
    });
    searchCols = searchCols.join(', ').replace(/,(?=[^,]*$)/g, ' or');
    searchInput.val('');
    table.columns(1).search('').columns(2).search('').columns(3).search('').draw();
    $("#searchInput").empty().append(createFilter(table, searchFields))
      .children('input.search').val(searchValue)
      .attr('placeholder', 'Search for '.concat(searchCols, '..'));
  });
  //active link after click second time (for mobile devices only)
  table.on('click', '.dropdown,.float', function() {
    $(this).toggleClass('actived');
  });
  //double click to select tr(s) 
  table.on('dblclick', 'tr:not(.group)', function(e) {
    $(this).toggleClass('selected');
  }).on('dblclick', 'td *', function(e) {
    e.stopPropagation();
  });
  //delete entries in selected tr(s) 
  $('#del').click(function() {
    var selected = table.rows('.selected').data().map((d, j) => {
      return d = d[0].split(/(?<=\d)\|\|\|/g)[0];
    }).toArray();
    if (localStorage.getItem(deletedItem) != null) {
      var storedItems = localStorage.getItem(deletedItem).split(',');
      localStorage.setItem(deletedItem, storedItems.concat(selected));
    } else {
      localStorage.setItem(deletedItem, selected);
    }
    table.rows('.selected').remove().draw(false);
  });
  //clear filterSection
  $('.filterSection .clear').click(function() {
    var filters = $(this).parent();
    var cols = filters.attr('class').replace(/.*(?=\d)/g, '');
    filters.children('select').children('option').prop('selected', false);
    filters.children('#datepicker').val('');
    table.columns(cols).search('').draw();
  });
  //reset default settings
  $('#reset').click(function() {
    $('.filter-holder.3 select option').prop("selected", false);
    $('.filter-holder.7 select option').prop("selected", true);
    table.columns(3).search('').draw(true);
    localStorage.setItem(deletedItem, [0]);
    location.reload();
  });
  $('.paginate_button, .dataTables_length,.filterSection, .filter-holder,#reset').on("click change", function(e) {
    table.draw(false);
  });
});
$(window).resize(function() {
  pageLayout();
});
$.fn.dataTable.ext.type.order['ranking-pre'] = function ( d ) {
     d= parseFloat(''.concat(d.match(/(^ranking:)(\d+)\|\|\|(.*)/)[2]));
	 return d;
};
$.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
  let
    type = data[8],
    types = $(".filter-holder.8 select").val() || [];
  return type.search('('.concat('(', types.join('|'), ')', ')')) > -1;
  // return true;
});