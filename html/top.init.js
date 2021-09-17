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
// let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g),
// hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const
  tabLink = links => '' + links.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">'),
  maTarget = q => 'https://www.metal-archives.com/' + q,
  maLink = (type, link) => '<a href="https://www.metal-archives.com/' + type + link + '"' +
    ">MA Page<i class='fa fa-medium'></i></a>",
  searchLink = text => {
    text = '<a href="https://bandcamp.com/search?q=' + text +
      "\">Bandcamp<i class='fa fa-search'></i></a>" +
      '<a href="https://www.youtube.com/results?search_query=' + text +
      "\">Youtube<i class='fa fa-search'></i></a>" +
      '<a href="https://open.spotify.com/search/' + text.replace(/\//g, '');
    text += window.matchMedia('(min-width: 767px)').matches ?
	'/spotify':'';
      text += '">Spotify<i class="fa fa-search"></i></a>' ;
    return text;
  };
 var
  pageLayout,
  genreOpt,
  url = "toplist",
  genreLoad = () => {
    genreOpt = $('#url-option').val()[0];
    $('#header').empty();
    $('title').empty();
    var title = '<span>Top-rated ';
    url = genreOpt != "Top" ?
      genreOpt.toLowerCase().charAt(0).concat('m') : 'top';
    url += "list";
    title += genreOpt != 'Top' ?
      genreOpt + ' Metal' : '';
    title += ' Albums on MA</span>';
    $(title).appendTo($('#header'));
    $(document).attr("title", $(title).text());
  };
pageLayout = () => {
    if (navigator.userAgent.search(/mobile/gi) < 0) {
      $.fn.DataTable.ext.pager.numbers_length = 9;
      if (window.matchMedia('(max-width: 767px)').matches) {
        // $(":root").css("font-size", "");
      } else {
        $(":root").css("font-size", "2.2vh");
      }
    } else {
      $.fn.DataTable.ext.pager.numbers_length = 5;
      $(":root").css("font-size", "3.8vw");
    }
  }
$(function () {
  pageLayout();
  genreLoad();
  $('.toplist').DataTable(
    {
      ajax: {
        url: url,
        dataFilter: function (data) {
          var json = jQuery.parseJSON(data);
          json.data = json.data.slice(0, -1);
          return JSON.stringify(json);
        },
      },
      autoWidth: false,
      deferRender: true,
      stateSave: true,
      stateDuration: 60 * 60 * 6,
      stateSaveParams: function (settings, data) {
        data.order = [[0, 'asc']]
      },
      order: [[0, 'asc']],
      lengthMenu: [10, 20, 50],
      search: {
        "regex": true
      },
	  dom: 'frt<"bottom"ip>',
      "columnDefs": [
        {
          render: (data, type, row) => {
            //rendering cover
            if (type === 'display') {
              let album_index = data.split('|||')[0],
                album_cover = data.split('|||')[1];
              return ('<img class="cover" src="https://www.metal-archives.com'
                .concat(album_cover, '" loading="lazy" alt="' +
                  album_index + '">'));
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
            // rendering album
            if (type === 'display') {
              let
                album_col = '',
                album_title = data.split('|||')[0],
                album_link = data.split('|||')[1];
                album_title = window.matchMedia('(max-width: 767px)').matches &album_title.length>20 ?
				album_title
				.replace(/(\s(?=\()|(?<!^\w{1,15})[\-\/\\\,\:\;]\s)(.*?$)/g, '$1\n $2')
				:
				album_title;
              album_col += "<div class='grid_item'>" + "<div class='Album flex_item'>" +
                "<a class='hreftext'>" +
                album_title
                  // .replace(/(\s(?=\()|(?<!^\w{1,15})[\-\/\\\,\:]\s)(.*?$)/g, '$1<br>$2')
                  // .replace(/((?<=\w{2,})[.​]{2,}|\b\.\s(?=\w{3,})(?=.{9,}))/g, '$1<br>')
                  .replace(/(\/){1,}/g, '$1<wbr>') +
                "</a><div class='dropdown'>" + 
				maLink("albums/id//", album_link) +
                searchLink(album_title).replace(/\/spotify\"/g, '/albums"') +
                '</div></div></div>';
              return tabLink("<div class='grid_wrapper'>".concat(album_col, '</div>'));
            }
            return data;
          },
          width: '12%',
          targets: [1],
        },
        {
          render: (data, type, row) => {
            //rendering band
            if (type === 'display') {
              let
                band = data.split('|||')[0].split(/\s[\/\|]\s/g),
                bandlink = data.split('|||')[1].split(/\s[\/\|]\s/g),
                band_col = band.map(
                  (item, i) => '' + "<div class='grid_item'><div class='flex_item'>" +
                    "<a class='hreftext'>" +
                    item + "</a>" + "<div class='dropdown'>" +
                    maLink("bands/id/", bandlink[i]) + searchLink(item).replace(/\/spotify\"/g, '/artists"') +
                    '</div></div></div>');
              return tabLink("<div class='grid_wrapper'>".concat(band_col.join(''), '</div>'));
            }
            return data;
          },
          width: '12%',
          targets: [2],
        },
        {
          render: (data, type) => {
            // genre
            if (type === 'display') {
              let genre_col = [];
              data.split(' | ').forEach(item => {
                var genre = item
                  .replace(/\/(?!Rock|.*?Metal)/g, ', \n')
                  .replace(/(\S+(\/\S+)+)/g, '\n$1\n')
                  .replace(/(?<=[;|\),])\s/g, ' \n')
                  .replace(/(?<=br\>|\n\s?)\n|^\n|\n(?=\s?(Metal[;,]?\s+?\n|\w+$))/g, '')
                  ;
                genre_col += "<div class='Genre grid_item'><p class='flex_item fixed'>";
				genre_col += window.matchMedia('(max-width: 767px)').matches?
				  genre:genre.replace(/(.*?)\n/m, "<a class='fixed'>    $1  ...\n</a></p><div class='flex_item ts fixed float'> $1\n");
                 genre_col +=  '</div></div>';

              });
              return tabLink(genre_col);
            }
            return data;
          },
          width: '10%',
          targets: [4],
        },
        {
          render: (data, type, row) => {
            // reviews
            let 
			 reviewers = data.split('|||')[0],
              range = data.split('|||')[1],
              mean = data.split('|||')[2],
              sd = data.split('|||')[3];
            return "<a class='scores'>".concat(data,
              '</a><div class="ratings ts"><div class="ts"><p>Reviews: <b>' +
              reviewers + '</b></p> <p> Min: <b>' +
              range.replace(/~.*/g, '') + '</b></p><p>Max: <b>' +
              range.replace(/.*?~/g, '') + '</b></p></div><div class="ts"><p> Mean: <b>' +
              mean + '</b></p> <p>SD: <b> ' +
              sd + '</b></p></div></div><div><div>');
          },
          createdCell: function (cell, data, cellData, rowData, row, col) {
            let album_index = cellData[0].split('|||')[0];
            $(cell).before('<td id="' + album_index + '" ></td>');
            $(cell).addClass('plot');
          },
          targets: [-3],
        },
        {
          render: (data, type, row) => {
            // scores
            return "<a class='scores'>".concat(data, '')
          },
          targets: [-2],
        },
        {
          render: (data, type) => {
            // continent
            if (type === 'display') {
              return "<p class='continent'>".concat(data, '</p>');
            }
            return data;
          },
          width: '0%',
          targets: [-1],
        },
      ],
      drawCallback: function (settings) {
        // rendering histograms
        var coldata = this.api().column(8, { page: 'current' }).data();
        coldata.map((item) => {
          var
            id = item.slice(0, 4),
            score = item.slice(8, -1).split(', ').map(score => score == '0' ? score = 1 : parseInt(score)),
            data = [{
              x: score,
              customdata: score,
              type: 'histogram',
              xbins: { start: 1, end: 105, size: 10 },
              histnorm: 'percent',
              hoverlabel: { bgcolor: "rgba(0,0,0,0.8)", bordercolor: "transparent", font: { color: "#eee" } },
              marker: {
                color: '#000',
              },
              hovertemplate: '<i>Ratings</i>: %{x}<br><i>Reviews</i>:%{customdata}<br><i>Percent</i>: %{y:.2f}%<extra></extra>',
            }],
            layout = {
              height: 180,
              margin: { t: 0, r: 45, b: 20, l: 50 },
              bargap: 0.05,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              barmode: "overlay",
              xaxis: {
                tick0: 0,
                dtick: 10,
                range: [-2, 102],
                fixedrange: true,
                linecolor: '#666',
                tickfont: {
                  color: '#666'
                },
              },
              yaxis: {
                tick0: 0,
                dtick: 20,
                range: [-1, 100],
                fixedrange: true,
                zeroline: false,
                autotick: false,
                gridcolor: 'rgba(55,55,55,.3)',
                color: '#666',
                tickfont: {
                  color: '#333'
                },
              },
              hoverlabel: {
                align: "left"
              }
            };
          Plotly.newPlot(id, data, layout, {
            displayModeBar: false
          });
          var plotCounts = document.getElementById(id).calcdata[0].map((bin, i) => bin = bin.pts.length);
          Plotly.restyle(id, { customdata: [plotCounts] });

        });
      },
    language: {
      searchPlaceholder: 'Search for albums or bands..',
      search: '_INPUT_',
      infoEmpty: ' ',
      info: '( _START_ - _END_ ) / _TOTAL_ ',
      infoFiltered: ' [ Total: _MAX_ ]',
	  lengthMenu: " _MENU_ ",
	  paginate: {"first":"First","last":"Last","next":"Next","previous":"Prev"},
    },
    });
  let table = $('.toplist').DataTable();
  // table.draw(); 
  table.on('xhr', function (e, settings, json, xhr) {
    var json = table.ajax.json();
    if (json) {
	  $('.filterWrapper').css({'display': 'grid',opacity:.1}).animate({opacity: 1,}, 1000);
      $('#update').html('Last updated on: ' + json.lastUpdate + '. ');
      $('#info').show().animate({ height: 'linear', opacity: 'easeOutBounce', }, "slow");
    }
  });
  $('#url-option').on('change', function () {
    // $(this).siblings().prop("selected", false);
    genreLoad();
    table.ajax.url(url).load();
    table.draw();
  });
  $('.toplist tbody').on('click', '.dropdown,.float', function () {
    $(this).toggleClass('actived');
  });
  $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function () {
    table.draw();
  });
  $('#reset').click(function () {
    $('.filter-holder select option').prop("selected", true);
    table.draw();
  });
  $('#glossary strong').click(function () {
    $('#glossary p').toggle("fast");
    $("#glossary strong i").toggleClass("fa-caret-right fa-caret-down");
  });
  // $('.filter').attr("checked", true);
});
$(window).resize(function () {
  pageLayout();
});
$(document).on('click', 'a.paginate_button', function () {
  $("body,html").animate({
    scrollTop: $("table thead").offset().top - 60
  }, 800);
});
if (($(window).width()) < 768) {
  $.fn.DataTable.ext.pager.numbers_length = 5;
} else {
  $.fn.DataTable.ext.pager.numbers_length = 9;
}
$.fn.dataTable.ext.search.push(
  function (settings, data, dataIndex) {
    let
      year = Number(data[6].match(/\d{4}/i).toString()),
      genre = data[4].toLowerCase(),
      continent = data[9],
      genres = $("#genre-options").val() || [],
      regions = $("#region-options").val() || [],
      years = $("#year-options").val() || [],
      yearsMin = [],
      yearsMax = [];
    years.forEach(function (item) {
      yearsMin.push(Number(item.match(/\d{4}/i)));
    });
    years.forEach(function (item) {
      yearsMax.push(Number(item.match(/\d{4}(?!\D)/gi)));
    });
    var yearMax = yearsMax.some(function (item) {
      return (item > year || item == year);
    });
    var yearMin = yearsMin.some(function (item) {
      return (item < year || item == year);
    });
    return (continent.search("(".concat(regions.join("|"), ")")) > -1 && genre.search("(".concat(genres.join("|"), ")")) > -1 && yearMin && yearMax);
    // return true;
  });
