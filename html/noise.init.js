$(function () {
  pageLayout();
  let table = $('.dataTables')
    .on('processing.dt', function (e, settings, processing) {
      preShow();
    })
    .DataTable({
      ...defaultParams,
      order: [[6, 'desc'], [9, 'desc'], [5, 'asc']],
      stateSaveParams: function (settings, data) {
        data.order = [[6, 'desc'], [9, 'desc'], [5, 'asc']];
        data.columns.forEach(item => {
          item.search.search = ''
        });
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
        // searchable: false,
        sorting: false,
        className: "col-cover col-id all",
        width: '14%',
        targets: [0],
      }, {
        className: "col-album all",
        width: '11%',
        targets: [1],
      }, {
        className: "col-band all",
        width: '10%',
        targets: [2],
      }, {
        render: (data, type, row) => {
          //rendering album
          if (type === 'display') {
            let
              format = /(.*)\|\|\|((?:artist|album))\:(.*)/,
              type = data.match(format)[2],
              href = data.match(format)[3],
              text = data.match(format)[1].toTitleCase(),
              release = row[8].match(/(.*)\|\|\|(.*)/)[2],
              extra = type == "artist" ? "" : '<abbr class="ts" style="opacity:.6;">- ' + release + ' -</abbr></div>',
              space = type == "artist" ? "" : '<br>',
              searchtype =
                type == "artist" ? '&type=band_name"' : '&type=album_title"';
            text =
              type == "artist" ? text :
                text
                  .replace(/((?<=\p{L}{4,})[\.\u200B]{2,}|(?<!^)[:;]\s|-\s?(?=\p{Lu}\p{Ll}))/gu, '$1\n')
                  .replace(/(((?<=\s)[\/\(\\～~](?=\s?\S{3,})|\d{2,}|(?<=\s)((V|v)o?l|(P|p)a?r?t)\.?\s[\p{Lu}\d]).*)/gu, '\n $1')
                  .replace(/(^|^\W+?$)\n+|\n(^.{1,3}$)|(^.{1,3}$)\n?/gm, '$1$2$3')
                  .replace(/(\n\s?)+/g, '\n')
                  .replace(/\n$|(?<=^\S{0,4}\s?)\n/g, '');
            let dropdown = "<div class='grid_item'><div class='flex_item'>" +
              "<a class='hreftext'>" + text + '</a>' +
              "<div class='dropdown ts' style='width:90%;'>" +
              "<a href=\"https://open.spotify.com/" + type + "/" + href +
              "\">Open in Spotify<i class='fa fa-spotify'></i></a>" +
              '<a href="https://www.metal-archives.com/search?searchString=' + text.replace(/\s?\(.*?\)/g, '') + searchtype +
              ">Search on MA<i class='fa fa-medium ts'></i></a>" +
              "</div><br>" + extra + '</div></div>';
            return dropdown;
          }
          return data;
        },
        targets: [1, 2],
      }, {
        //genre
        render: function (data, type, row) {
          if (type === 'display') {
            let format = /(\d+)\|\|\|(.*)/;
            let genre = data.replace(/(?<=[,])\s/g, ' \n').toTitleCase();
            return "<div class='ts '><div class='flex_item ts genre'>" +
              genre + '</div></div>';
          }
          return data;
        },
        className: "col-genre all",
        sorting: false,
        width: '9%',
        targets: [3],
      }, {
        render: (data, type, row) => {
          // similar
          if (type === 'display') {
            switch (data) {
              case '':
                data = "<i class='ts extra'>No data</i>";
                break;
              case 'NULL, NULL':
                data = "<i class='ts extra'>No data</i>";
                break;
              default:
				  var format = /(.*)\|(.*)/,
				  floated = data.split("\|;").map((item, i) => {
					  var
						artist = item.match(format)[2],
						artist_id = item.match(format)[1];
						
                     return '<a href="https://open.spotify.com/artist/' +  
						artist_id  + '" target="_blank" rel="noopener noreferrer">' + artist  + '</a>'
                  });
				  fixed =data.split("\|;").map((item, i) => {
                     return  item.match(format)[2].toTitleCase()
                  });
				  data = "<div class='grid_wrapper ts'><div class='grid_item ts'><div class='flex_item ts fixed'>" +
					fixed.join(', ') + 
					"</div><div class='flex_item ts fixed float'>" + floated.join(', ') + '</div></div></div>';
            }
          }
          return data;
        },
        className: "col-simi not-tablet ",
        sorting: false,
        width: '10%',
        targets: [4],
      }, {
        render: (data, type, row) => {
          //rendering rank
          if (type === 'display') {
            var
              format = /(^ranking:)([0-9\+eE]+)\|\|\|(.*)/,
              followers = parseFloat(data.match(format)[3]).toLocaleString(undefined),
              ranking = parseFloat(data.match(format)[2]);
			  ranking = ranking >= 1000000000 ? "Unavaliable" : ranking.toLocaleString(undefined);
            return '<div class="ts"><abbr style="opacity:.7;">Ranking: </abbr>' + ranking +
              '<br><abbr style="opacity:.7;">Listeners: </abbr>' + followers + "</div>";
          }
          return data;
        },
        className: "col-rank not-tablet",
        type: "ranking",
        width: '9%',
        targets: [5],
      }, {
        className: "col-date never",
        visible: false,
        targets: [6],
      }, {
        render: (data, type, row) => {
          //rendering label
          if (type === 'display') {
            switch (data) {
              case '':
                data = "<i class='ts' style='opacity:.7;'>(No data)</i>";
                break;
              default:
                var
                  indepedent = "<i class='ts'>Self-released</i>",
                  label = data.toLowerCase(),
                  labelname = data.search(/(\d+\sRecords DK)/) > -1 ? '<a class="hreftext" href="https://distrokid.com/">DistroKid</a>' :
                    data.replace(/\s?,\s/g, ',\n'),
                  band = row[2].toLowerCase().match(/(.*)\|\|\|(.*)/)[1];
                data = (label.search(band) >= 0 || band.search(label) >= 0 || label == ('default' || 'indepedent')) ? indepedent : labelname
            }
          }
          return '<div class="ts">' + data + '</div>';
        },
        className: "col-label not-fablet",
        sorting: false,
        width: '8%',
        targets: [7],
      }, {
        render: (data, type, row) => {
          //rendering length
          if (type === 'display') {
            var
              format = /(.*)\|\|\|(.*)/,
              type = data.match(format)[2],
              lengths = data.match(format)[1];
            // type = data;
            return '<div class="ts">' + lengths +
              ' </div>';
          }
          return data;
        },
		className: "col-length not-fablet",
        width: '7%',
        targets: [8],
      }, {
        render: (data, type, row) => {
          //rendering date
          if (type === 'display') {
            var format = /(.*)\|\|\|(.*)/;
            return '<div class="ts">' + data + ' </div>';
            // return (data.slice(0, 4).concat('-', data.slice(4, 6), '-', data.slice(6)));
          }
          return data;
        },
        className: "col-update all",
        width: '7%',
        targets: [-1],
      },],
      drawCallback: function (settings) {
        $("a").attr({ "target": "_blank", "rel": "noopener noreferrer" });
        //group rows by date
        var
          api = this.api();
        /* groupColumn = 6,
         rows = api.rows({
         page: 'current'
         }).nodes(),
         last = '';
         api.column([groupColumn], {
         page: 'current'
         }).data().each(function(data, i) {
         var
         update = data.slice(0, 8),
         update = moment(update, 'YYYYMMDD').format('Do MMM, YYYY');
         if (last !== update) {
         $(rows).eq(i).before('<tr class="group ts"><td colspan="2"></td>' +
         '<td class=\'prev\'><i class=\'fa fa-angle-left\'></i></td>' +
         '<td class="ts" colspan="2"> <abbr style="opacity:.6; color: #fff;">Updated on: </abbr>\n' + update + '</td>' +
         '<td class=\'next\'><i class=\'fa fa-angle-right\'></i></td>' +
         '<td colspan="3"></tr>');
         last = update;
         }
         });
         //cancel groups
         $('.dataTables th').on('click', function cancelGroup() {
         var currentOrder = table.order()[0][0];
         if (currentOrder == groupColumn) {
         $('table tr.group').css('display', 'table-row');
         } else {
         $('table tr.group').css('display', 'none');
         }
         }); */
        callbackShow(api);
      },
      initComplete: function () {
        initShow();
        var api = this.api();
        searchBox(api);
        modifyItems(api);
        var select;
        api.columns('.col-genre').every(function () {
          var column = this, colname  = $(this.header()).attr('class').match(/col-(\S*)/)[1];
          $('<select><option value=""></option></select>')
            .attr("id",  'select-'+ colname  )
            .insertBefore('.filter-' + colname   + ' .clear')
            .on('change', function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? val + '' : '', true, false).draw();
            });
        });
        // select box for labels
        api.columns('.col-genre').every(function () {
          select = $('#select-genre');
          var genres =
            this.data().map((d, j) => {
              return d = d.toTitleCase().split(/,\s?/);
            }).flatten().sort().reduce(function (obj, item) {
              obj[item] = (obj[item] || 0) + 1;
              return obj;
            }, {});
          Object.entries(genres).forEach(entry => {
            const [key, value] = entry;
            select.append('<option value="' + key + '">' + key + ' (' + value + ') ' + '</option>');
          });
        });
      },
    });
  //clear filterSection
  $('.filterSection .clear').click(function () {
    var filters = $(this).parent();
    var cols = filters.attr('class').replace(/.*filter-/g, '.col-').replace(/[\s\d]/g, '');
    filters.children('select').children('option').prop('selected', false);
    table.columns(cols).search('').draw();
  });
  //reset default settings
  $('#button-def').click(function () {
    // $('.filter-holder select option').prop("selected", true);
    // $('.sel-genre select option').prop("selected", false);
    table.columns().every( function () {this .search( '' ); } );
    table.order([[6, 'desc'], [9, 'desc'], [5, 'asc']]).draw();
  });
  $('.paginate_button, .dataTables_length,.filterSection, .filter-holder,#reset').on("click change", function (e) {
    table.draw(false);
  });
  $(window).on("resize load ", function () {
    pageLayout(table);
  });
});
$.fn.dataTable.ext.type.order['ranking-pre'] = function (d) {
  d = parseFloat(''.concat(d.match(/(^ranking:)([0-9\+eE]+)\|\|\|(.*)/)[2]));
  return d;
};
$.fn.dataTable.ext.search = 
 $.fn.dataTable.ext.search.filter(function (fun) { return fun.name !== 'filterSec' } ).concat(
          function filterSec(settings, data, dataIndex) {
  let
    type = data[8],
    types = $("#select-length").val() || [];
  return type.search('('.concat('(', types.join('|'), ')', ')')) > -1;
  // return true;
});