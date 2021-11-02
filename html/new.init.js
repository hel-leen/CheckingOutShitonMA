 // moment.locale(userLang);
 let thisday = moment().format('YYYY-MM-DD');
 var thisweek = moment().day() >= 5 ?
   moment().day(5).subtract(0, 'days').format('YYYY-MM-DD') :
   moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
 const maTarget = q => 'https://www.metal-archives.com/' + q;
 const maLink = (type, link) => '<a href="https://www.metal-archives.com/' + type + link + '"' +
   ">MA Page<i class='fa fa-medium'></i></a>";
 const searchLink = text => {
   text = '<a href="https://bandcamp.com/search?q=' + text +
     "\">Bandcamp<i class='fa fa-search'></i></a>" +
     '<a href="https://www.youtube.com/results?search_query=' + text +
     "\">Youtube<i class='fa fa-search'></i></a>" +
     '<a href="https://open.spotify.com/search/' + text.replace(/\//g, '');
   text += mobile ?
     '">Spotify<i class="fa fa-search"></i></a>' :
     '/spotify">Spotify<i class="fa fa-search"></i></a>'
   return text;
 };
 const pageLayout = () => {
   if (!mobile) {
     $.fn.DataTable.ext.pager.numbers_length = 9;
     if (sScreen) {
       $(":root").css("font-size", "2.1vh");
     } else {
       $(":root").css("font-size", "2.2vh");
     }
   } else {
     $.fn.DataTable.ext.pager.numbers_length = 5;
     $(":root").css("font-size", "3.7vw");
   }
 }


 $(function() {
   pageLayout();
   $('#datepicker').val(thisweek);
   $('#datepicker').dtDateTime({
	   locale: userLang,
	   minDate: moment().add(-1, 'years').toDate(),
	   maxDate: moment().add(1, 'years').toDate()
	   });
   $('.dataTables').DataTable({
     // processing: true,
     // serverSide: true,
     dom: 'rt<"bottom"<<"#res.btm"> i<"#del.btm">>p>',
     autoWidth: false,
     fixedHeader: true,
     scrollCollapse: true,
     orderCellsTop: false,
     deferRender: true,
     order: [
       [8, 'asc'],
       [0, 'desc']
     ],
     lengthMenu: [50, 100, 200, 400],
     search: {
       regex: true,
       smart: true,
     },
     stateSave: true,
     stateDuration: 60 * 60 * 24 * 7,
     stateSaveParams: function(settings, data) {
       data.order = [
         [8, 'asc'],
         [0, 'desc']
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
       sorting: false,
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
             .replace(/\n$/g, '') +
             "</a><div class='dropdown'>" +
             maLink("albums/id//", album_link) +
             searchLink(album_title).replace(/\/spotify\"/g, '/albums"') +
             "</div><br><abbr class='extra ts'>(" + album_type + ')</abbr></div></div>';
           return "<div class='grid_wrapper'>".concat(album_col, '</div>');
         }
         return data;
       },
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
			   .replace(/\//g, ' / ')
               ;
             genre_col.push("<div class='grid_item'><div class='flex_item ts genre'>" +
               genre + '</div></div>');
           });
           return "<div class='grid_wrapper'>".concat(genre_col.join(''), '</div>');
         }
         return data;
       },
       sorting: false,
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
       searchable: false,
       sorting: false,
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
       searchable: false,
       sorting: false,
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
				maLink("labels/id/", data.match(format)[1])+ searchLink(labeltext).replace(/\/spotify\"/g, '/profiles"')+
                 "</div></div></div>";
           }
           return data;
         }
         return data;
       },
       sorting: false,
       width: '9%',
       targets: [6],
     }, {
       //duration and type
       render: function(data, type, row) {
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
           return date  + earlydate ;
         }
         return data;
       },
       width: '8%',
       targets: [8],
     }],
     drawCallback: function(settings) {
	  $("a").attr({"target": "_blank", "rel":"noopener noreferrer"});
       //group rows by date
       var
         groupColumn = $('.dataTables tr:nth-last-child(1) th').length-1,
         api = this.api(),
         rows = api.rows({
           page: 'current'
         }).nodes(),
         last = '';
       api.column(groupColumn, {
         page: 'current'
       }).data().each(function(group, i) {
         var date = group.match(/^\d.{9}/g).toString();
         date = (
           // moment(date).format('YYYY') != moment().format('YYYY') ? moment(date).format('MMM YYYY') :
            // moment(date).format('MM') != moment().format('MM') ? moment(date).format('MMMM') :
			// moment(date,'Do MMM')
			moment(date).format('Do MMM, YYYY')
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
       api.columns([2, 6]).every(function() {
         var column = this;
         $('<select><option value=""></option></select>')
           .insertBefore('.filter-holder.' + this[0] + ' .clear')
           .on('change', function() {
             var val = $.fn.dataTable.util.escapeRegex($(this).val());
             column.search(val ? val + '$' : '', true, true).draw();
           });
       });
       // select box for countries
       api.columns(2).every(function() {
         select = $('.filter-holder.' + this[0] + ' select');
         var countries =
           this.data().map((d, j) => {
             return d = d.split('|||')[2].split('| || |');
           }).flatten().sort().reduce(function(obj, item) {
             obj[item] = (obj[item] || 0) + 1;
             return obj;
           }, {});
         Object.entries(countries).forEach(entry => {
           const [key, value] = entry;
           select.append('<option value="' + key + '">' + key + ' (' + value + ') ' + '</option>');
         });
       });
       // select box for labels
       api.columns(6).every(function() {
         select = $('.filter-holder.' + this[0] + ' select');
         var lables =
           this.data().unique().filter(v => v != '').map(d => d.match(/(?<=\d')(.*)/)[1]).sort(partSort).each(opval => {
             select.append('<option value="' + opval + '">' + opval + '</option>');
           });
       });
       // time serials 
       api.columns(8).every(function() {
         var
           column = this,
           frames = [],
           date =
           Object.entries(this.data().map((d, j) => {
             return d = d.split('|||')[0];
           }).reduce(function(obj, item) {
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
               x0: thisweek,
               y0: 0,
               x1: xrange,
               y1: 1,
               type: 'gradient',
               xref: 'x',
               yref: 'paper',
               fillcolor: 'rgba(222,222,222,.2)',
               opacity: .1,
               line: {
                 width: 0
               },
               marker: {
                 color: 'rgba(238, 221, 204,.5)',
                 gradient: {
                   color: "rgba(31, 119, 180, .8)",
                   type: "horizontal"
                 }
               }
             }]
           }
           if (thisday <= xrange) {
             frames[i].layout.annotations = [{
               x: thisday,
               y: date.filter(item => item[0] == thisday)[0][1],
               xref: 'x',
               yref: 'y',
               ax: 20,
               ay: -25,
               text: 'Today',
               showarrow: true,
               arrowhead: 1,
               arrowsize: 1,
               arrowwidth: 1,
               arrowcolor: '#636363',
             }]
           }
         }
         var layout = {
           height: 160,
           margin: {
             t: 0,
             r: 10,
             b: 22,
             l: 10
           },
           showlegend: false,
           paper_bgcolor: "rgba(0,0,0,0)",
           plot_bgcolor: "rgba(0,0,0,0)",
           font: {
             color: 'rgba(238,221,204,.7)',
           },
           xaxis: {
             automargin: false,
             fixedrange: true,
             showgrid: false,
             linecolor: 'rgba(222,222,222,.2)',
             tickfont: {
               color: 'rgba(222,222,222,.6)',
               size: 11
             },
             tickformat: '%_d %b',
             tickwidth: 1,
             tickcolor: 'rgba(111,111,111,.5)',
             range: [frames.slice(-1)[0].data.slice(-1)[0].x[0], frames.slice(-1)[0].data.slice(-1)[0].x.slice(-1)[0]],
           },
           yaxis: {
             range: [0, yrange],
             gridcolor: 'rgba(111,111,111,.2)',
             showgrid: true,
             zeroline: false,
             showline: false,
             autotick: true,
             ticks: '',
             fixedrange: true,
             showticklabels: false
           },
         };

         function update() {
           Plotly.animate('timecharts', frames, {
             transition: {
               duration: 0,
             },
             frame: {
               duration: 1,
               redraw: false,
             }
           });
         };
         Plotly.newPlot('timecharts', frames[0].data, layout, {
             displayModeBar: false
           })
           .then(setTimeout(function() {
             update()
           }, 1000));
         // .then(setTimeout(function(){ $('#timecharts') .hide(1000); }, frames.length*40 ) );
         document.getElementById('timecharts').on('plotly_click', function(data) {
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
       if (localStorage.getItem(deletedItem) != undefined) {
         var selected = localStorage.getItem(deletedItem).split(',').join('|');
         api.columns(0).search('^('.concat(selected, ')'), true).rows({
           search: 'applied'
         }).remove().column(0).search('').draw();
       };
     },
   });
   let table = $('.dataTables').DataTable();
   table.columns().visible(true);
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
     table.columns(1).search('').columns(2).search('').columns(3).search('').columns(6).search('').draw();
     $("#searchInput").empty().append(createFilter(table, searchFields))
       .children('input.search').val(searchValue)
       .attr('placeholder', 'Search for '.concat(searchCols, '..'));
   });

   //active link after click second time 
   // (for mobile devices only)
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
   //restore deleted entries
   $('#res').click(function() {
     localStorage.setItem(deletedItem, [0]);
     location.reload();
   });
   //clear filterSection
   $('.filterSection .clear').click(function() {
     var filters = $(this).parent();
     var cols = filters.attr('class').replace(/.*(?=\d)/g, '');
     filters.children('select').children('option').prop('selected', false);
     filters.children('#datepicker').val('');
     table.columns(cols).search('').draw();
   });
   $('#datecondition').click(function() {
     if ($(this).val() == 'After') {
       $(this).val('Before');
       $(this).css('text-shadow', '0px 0px 1px #d99');
       table.order([
         [8, 'desc'],
         [0, 'desc']
       ]).draw(true);
     } else {
       $(this).val('After');
       $(this).css('text-shadow', '0px 0px 1px #9b9');
       table.order([
         [8, 'asc'],
         [0, 'desc']
       ]).draw(true);
     }
   });
   // sortHandlers
   function sortHandler1() {
     table.order([0, 'desc']).draw();
     $(this).one("click", sortHandler2);
   }

   function sortHandler2() {
     table.order([
       [8, 'asc'],
       [0, 'desc']
     ]).draw();
     $(this).one("click", sortHandler1);
   }
   $("#Newest").one("click", sortHandler1);
   //reset default settings
   $('#all, #reset, #Reset').click(function() {
     table.columns().search('').draw();
     table.order([
       [8, 'desc'],
       [0, 'desc']
     ]).draw();
   });
   $('#reset, #Reset').click(function() {
     $('#datecondition').val('After');
     $('#datepicker').val(thisweek);
     table.order([
       [8, 'asc'],
       [0, 'desc']
     ]).draw();
   });
   $('#datepicker, #today, #Today, .dt-datetime-today').click(function() {
     $('#datepicker').val(thisday);
     table.draw();
   });
   $('.filter,.genrefilter,.paginate_button, .dataTables_length, .filter-holder,#reset').on("click change", function( ) {
     table.draw();
   });

 });
 $(window).resize(function() {
   pageLayout();
 });
 $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
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