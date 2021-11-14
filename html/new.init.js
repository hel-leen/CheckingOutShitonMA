let thisday = moment().format('YYYY-MM-DD');
var thisweek = moment().day() >= 5 ?
  moment().day(5).subtract(0, 'days').format('YYYY-MM-DD') :
  moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
$(window).on("resize load ", function () {
  pageLayout();
  // $('.dataTables').DataTable().draw(false)
});
$(function () {
  $('#datepicker').val(thisweek);
  $('#datepicker').dtDateTime({
    minDate: moment().add(-1, 'years').toDate(),
    maxDate: moment().add(1, 'years').toDate()
  });
  let table = $('.dataTables')
    .on('processing.dt', function (e, settings, processing) {
      preShow();
    })
    .on('init.dt', function () {
      initShow();
    })
    .DataTable({
      ...defaultParams,
      responsive: true,
      order: [[8, 'asc'], [0, 'desc']],
      stateLoadParams: function (settings, data) {
        data.order = [[8, 'asc'], [0, 'desc']];
        data.columns.forEach(item => { item.search.search = '' });
      },
      columnDefs: [{
        //rendering cover
        render: (data, type, row) => {
          if (type === 'display') {
            let album_id = data.split(/(?<=\d)\|\|\|/g)[0];
            let album_cover = data.split(/(?<=\d)\|\|\|/g)[1];
            switch (album_cover) {
              case '/images/cat.jpg':
                album_cover = '<svg  data-prefix="fad" data-icon="compact-disc" role="img" viewBox="0 0 512 512" class="nocover"><g><path d="M248,8C111,8,0,119,0,256S111,504,248,504,496,393,496,256,385,8,248,8ZM88,256H56C56,150.1,142.1,64,248,64V96C159.8,96,88,167.8,88,256Zm160,96a96,96,0,1,1,96-96A96,96,0,0,1,248,352Z"></path><path d="M248,160a96,96,0,1,0,96,96A96,96,0,0,0,248,160Zm0,128a32,32,0,1,1,32-32A32,32,0,0,1,248,288Z"></path><text x="256" y="275"  fill="currentColor"></text></g></svg>';
                break;
              default:
                album_cover = '<img src="https://www.metal-archives.com'.concat(album_cover, '" loading="lazy">');
            }
            return album_cover;
          }
          return data;
        },
        // searchable: false,
        // sorting: false,
        responsivePriority: 1,
        width: '16%',
        targets: [0],
      }, {
        // rendering album
        render: (data, type, row) => {
          if (type === 'display') {
            let format = /(.*)\|\|\|(\d+)\|\|\|(.*)/;
            let album_col = '';
            let album_title = data.match(format)[1].toTitleCase();
            let album_link = data.match(format)[2];
            let album_type = data.match(format)[3];
            album_col += "<div class='grid_item'>" + "<div class='flex_item'>" + "<a class='hreftext'>" +
              album_title
                .replace(/((?<=\p{L}{4,})[\.​]{2,}|(?<!^)[:;]\s|-\s?(?=\p{Lu}\p{Ll}))/gu, '$1\n')
                .replace(/(([\/\(\\～~]|\d{2,}|(?<=\s)((V|v)o?l|(P|p)a?r?t)\.?\s[\p{Lu}\d]).*)/gu, '\n $1')
                .replace(/(^|^\W+?$)\n+|\n(^.{1,3}$)|(^.{1,3}$)\n?/gm, '$1$2$3')
                .replace(/(\n\s?)+/g, '\n')
                .replace(/\n$|(?<=^\S{0,4}\s?)\n/g, '') +
              "</a><div class='dropdown'>" +
              maLink("albums/id//", album_link) +
              searchLink(album_title).replace(/\/spotify\"/g, '/albums"') +
              "</div><br><abbr class='extra ts'>(" + album_type + ')</abbr></div></div>';
            return "<div class='grid_wrapper'>".concat(album_col, '</div>');
          }
          return data;
        },
        responsivePriority: 1,
        width: '11%',
        targets: [1],
      }, {
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
            return "<div class='grid_wrapper'>".concat(band_col.join(''), '</div>');
          }
          return data;
        },
        responsivePriority: 1,
        width: '11%',
        targets: [2],
      }, {
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
                .replace(/\//g, ' / ');
              genre_col.push("<div class='grid_item'><div class='flex_item ts genre'>" +
                genre + '</div></div>');
            });
            return "<div class='grid_wrapper'>".concat(genre_col.join(''), '</div>');
          }
          return data;
        },
        sorting: false,
        responsivePriority: 1,
        width: '11%',
        targets: [3],
      }, {
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
                item.split('|').filter(uniq).sort((x, y) => {
                  var xp = x.toLowerCase().match(format)[2],
                    yp = y.toLowerCase().match(format)[2];
                  return xp == yp ? 0 : xp < yp ? -1 : 1;
                }).map(link => {
                  return '<a href="https://www.metal-archives.com/bands/view/' +
                    link.match(format)[1] + '">' +
                    link.match(format)[2] + '</a>';
                }).join(', ') :
                "<i class='extra'>(No data)</i>";
              rows += '</div></div>';
              return rows;
            });
            return "<div class='grid_wrapper ts'>".concat(info.join(''), '</div>');
          }
          return data;
        },
        // searchable: false,
        sorting: false,
        responsivePriority: 2,
        width: '10%',
        targets: [4],
      }, {
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
            return "<div class='grid_wrapper ts'>".concat(info.join(''), '</div>');
          }
          return data;
        },
        sorting: false,
        responsivePriority: 2,
        width: '10%',
        targets: [5],
      }, {
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
                  maLink("labels/id/", data.match(format)[1]) + searchLink(labeltext).replace(/\/spotify\"/g, '/profiles"') +
                  "</div></div></div>";
            }
            return data;
          }
          return data;
        },
        sorting: false,
        responsivePriority: 3,
        width: '9%',
        targets: [6],
      }, {
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
        responsivePriority: 3,
        width: '7%',
        targets: [7],
      }, {
        // date
        render: (data, type, row) => {
          if (type === 'display') {
            let date = data.split('|||')[0];
            let earlydate = data.split('|||')[1];
            switch (earlydate) {
              case '0000-00-00':
                earlydate = "<i style='display:none;'>(unknown)</i>";
                break;
              default:
                earlydate = "<br><abbr class='extra'>(" + earlydate + ')</abbr>';
            }
            return date + earlydate;
          }
          return data;
        },
        responsivePriority: 1,
        width: '8%',
        targets: [8],
      }],
      drawCallback: function (settings) {
        //group rows by date
        var api = this.api();
        callbackShow(api, 8);
        $('tr.group abbr').text('');
      },
      initComplete: function initComp() {
        initShow();
        var api = this.api();
        searchBox(api);
        modifyItems(api);
        // select boxes
        var select;
        api.columns([2, 6]).every(function selectBoxes() {
          var column = this;
          $('<select><option value=""></option></select>')
            .attr("name", this[0])
            .insertBefore('.filter-holder.' + this[0] + ' .clear')
            .on('change', function boxesVal() {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? val + '$' : '', true, true).draw();
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
        // select box for labels
        api.columns(6).every(function () {
          select = $('.filter-holder.' + this[0] + ' select');
          var lables =
            this.data().unique().filter(v => v != '').map(d => d.match(/(?<=\d')(.*)/)[1]).sort(partSort).each(opval => {
              select.append('<option value="' + opval + '">' + opval + '</option>');
            });
        });
        // time serials 
        api.columns(8).every(function () {
          var
            column = this,
            frames = [],
            date =
              Object.entries(this.data().map((d, j) => {
                return d = d.split('|||')[0];
              }).reduce(function (obj, item) {
                obj[item] = (obj[item] || 0) + 1;
                return obj;
              }, {}))
                .filter(entry => {
                  var datevalue = moment(entry[0]).toDate(),
                    days = 60 * 60 * 24 * 1000 * window.innerWidth / 25;
                  if (datevalue < (moment().valueOf() + days / 2) & datevalue > (moment().valueOf() - days))
                    return entry
                });
          var
            x = date.map(entry => {
              return entry = entry[0]
            }),
            y = date.map(entry => {
              return entry = entry[1];
            }),
            xrange, yrange = (Math.floor(Math.max(...y) / 10) + 3) * 10,
            texts = x.map(item => {
              item == thisday ? item = 'Today' : item = '';
              return item
            });
          for (var i = 0; i <= y.length; i++) {
            var colorfill = 'hsla('.concat(((i + 1) * 360 / y.length) - 0),
              alphafill = Math.abs(Math.sin(Math.floor((i + 50) / 50))) / 50 + 0.02;

            function trace() {
              this.x = x.slice(0, i + 1)
              this.fillcolor = ''
              this.type = "scatter"
              this.mode = "lines+text"
              this.fill = 'tonexty'
              this.textposition = 'top center'
              this.hoverlabel = {
                bgcolor: "rgba(0,0,0,0.8)",
                bordercolor: "transparent",
                font: {
                  color: "#ccc"
                },
              }
              this.hoverinfo = 'skip'
            };

            function makeTraces(n) {
              var traces = new Array(n)
              for (var j = 0; j < n; ++j) {
                traces[j] = {
                  ...new trace(),
                  y: y.slice(0, i + 1).map(y => {
                    return y = y * j / (n - 1)
                  }), line: {
                    'color': colorfill.concat(',.5,.6,', alphafill * j / (n - 1), ')'),
                    'width': 0
                  },
                  name: "lines" + j, fillcolor: colorfill.concat(',.4,.6,', alphafill * j / (n - 1) + 0.02, ')'), text: new Array(x.slice(0, i + 1).length).fill('')
                };
              }
              return traces
            };
            n = 2;
            frames[i] = {
              data: (makeTraces(n)),
              layout: {
                // xaxis: { range: [] } ,
                shapes: []
              },
            };
            frames[i].data[n - 1].line = {
              'color': colorfill.concat(',.4,.7, .3)'),
              width: 1.5
            };
            frames[i].data[n - 1].hovertemplate = '%{x|%_d %b (%a)}: %{y} releases <br> Click to see details <extra></extra>'
            xrange = x.slice(0, i + 1).slice(-1)[0];
            if (thisweek <= xrange) {
              frames[i].layout.shapes = [{
                x0: thisweek, y0: 0, x1: xrange, y1: 1, type: 'gradient', xref: 'x', yref: 'paper',
                fillcolor: 'rgba(222,222,222,.2)',
                opacity: .1,
                line: { width: 0 },
                marker: { color: 'rgba(238, 221, 204,.5)', gradient: { color: "rgba(31, 119, 180, .8)", type: "horizontal" } }
              }]
            }
            if (thisday <= xrange) {
              frames[i].layout.annotations = [{
                x: thisday, y: date.filter(item => item[0] == thisday)[0][1],
                xref: 'x', yref: 'y', ax: 20, ay: -25, text: 'Today', showarrow: true, arrowhead: 1, arrowsize: 1, arrowwidth: 1, arrowcolor: '#636363',
              }]
            }
          }
          var layout = {
            height: 160,
            margin: { t: 0, r: 10, b: 22, l: 10 },
            showlegend: false,
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: {
              color: 'rgba(238,221,204,.7)',
            },
            xaxis: {
              automargin: false, fixedrange: true, showgrid: false, linecolor: 'rgba(222,222,222,.2)',
              tickfont: { color: 'rgba(222,222,222,.6)', size: 11 },
              tickformat: '%_d %b', tickwidth: 1, tickcolor: 'rgba(111,111,111,.5)',
              range: [frames.slice(-1)[0].data.slice(-1)[0].x[0], frames.slice(-1)[0].data.slice(-1)[0].x.slice(-1)[0]],
            },
            yaxis: {
              range: [0, yrange],
              gridcolor: 'rgba(111,111,111,.2)',
              showgrid: true, zeroline: false, showline: false, autotick: true, ticks: '', fixedrange: true, showticklabels: false
            },
          };

          function update() {
            Plotly.animate('timecharts', frames, { transition: { duration: 0, }, frame: { duration: 1, redraw: false, } });
          };
          Plotly.newPlot('timecharts', frames[0].data, layout, {
            displayModeBar: false
          })
            .then(setTimeout(function () {
              update()
            }, 1000));
          // .then(setTimeout(function(){ $('#timecharts') .hide(1000); }, frames.length*40 ) );
          document.getElementById('timecharts').on('plotly_click', function plotlyClick(data) {
            var val = '';
            for (var i = 0; i < data.points.length; i++) {
              var val = $.fn.dataTable.util.escapeRegex(data.points[i].x);
              if (val != '') {
                $('body,html').animate({
                  scrollTop: $('.dataTables tbody').offset().top - $(".dataTables_filter").height() - 8,
                }, 800);
                $('.filter-holder.8 input').val('');
                column.search(val ? '^' + val : '', true, true).draw();
              }
            }
          });
        });
      },
    })
    .on('responsive-resize', function (e, api, columns) {
      var count = columns.reduce(function (a, b) {
        return b === false ? a + 1 : a;
      }, 0);
      // console.log(count + ' column(s) are hidden' + '\n' + api);
    });
  $("#timecharts").addClass("hideItem");
  table.columns().visible(true);
  //clear filterSection
  $('.filterSection .clear').click(function () {
    var filters = $(this).parent();
    var cols = filters.attr('class').replace(/.*(?=\d)/g, '');
    filters.children('select').children('option').prop('selected', false);
    filters.children('#datepicker').val('');
    table.columns(cols).search('').draw();
  });
  // sortHandlers
  function sortById() {
    table.order([0, 'desc']).draw();
    $(this).one("click", sortDefault);
  }

  function sortDefault() {
    table.order([[8, 'asc'], [0, 'desc']]).draw();
    $(this).one("click", sortById);
  }
  $("#Newest").one("click", sortById);

  //reset default settings
  $('#all, #reset, #Reset').click(function resetAll() {
    table.columns().search('').draw();
    table.order([[8, 'desc'], [0, 'desc']]).draw();
  });
  $('#reSet, #Reset').click(function reset() {
    $('#datecondition').val('After');
    $('#datepicker').val(thisweek);
    table.order([[8, 'asc'], [0, 'desc']]).draw();
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
  $('#datepicker, #today, #Today, .dt-datetime-today').click(function datePicker() {
    $('#datepicker').val(thisday);
    table.draw();
  });
  $('.filter,.genrefilter, .dataTables_length, .filter-holder,#reset').on("click change", function filterSection() {
    table.draw();
  });

});


$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
  let type = data[1].match(/(.*)\|\|\|(\d+)\|\|\|(.*)/)[3];
  let genre = data[3].toLowerCase();
  let date = data[8].split('|||')[0];
  var dateCount = [];
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