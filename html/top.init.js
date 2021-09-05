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
const layout = () => {
  if (navigator.userAgent.search(/mobile/gi) < 0) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (window.matchMedia('(max-width: 767px)').matches) {
      // $(":root").css("font-size", "");
    } else {
      $(":root").css("font-size", "2.2vh");
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", "4vw");
  }
}
var genre;
var url = "toplist";
let genreLoad = () => {
  genre = $('#url-option').val()[0];
  $('#header').empty();
  $('title').empty();
  var title = '<span>Top-rated ';
  url = genre != "Top" ?
    genre.toLowerCase().charAt(0).concat('m') : 'top';
  url += "list";
  title += genre != 'Top' ?
    genre + ' Metal' : '';
  title += ' Albums on MA</span>';
  $(title).appendTo($('#header'));
  $(document).attr("title", $(title).text());
}
$(function () {
  layout();
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
      "lengthMenu": [10, 20, 50, "All"],
      "search": {
        "regex": true
      },
      "columnDefs": [
        {
          //rendering cover
          render: (data, type, row) => {
            if (type === 'display') {
              let album_index = data.split('|||')[0];
              let album_cover = data.split('|||')[1];
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
          // rendering album
          render: (data, type, row) => {
            if (type === 'display') {
              let album_col = '';
              let album_title = data.split('|||')[0];
              let album_link = data.split('|||')[1];
              album_col += "<div class='grid_item'>" + "<div class='Album flex_item'>" +
                "<a class='hreftext'>" +
                album_title
                  .replace(/(\s(?=\()|(?<!^\w{1,15})[\-\/\\\,\:]\s)(.*?$)/g, '$1<br>$2')
                  .replace(/((?<=\w{2,})[.​]{2,}|\b\.\s(?=\w{3,})(?=.{9,}))/g, '$1<br>')
                  .replace(/(\/){1,}/g, '$1<wbr>') +
                '</a>' +
                "<div class='dropdown'>" + maLink("release/view/id/", album_link) +
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
          //rendering band
          render: (data, type, row) => {
            if (type === 'display') {
              let band = data.split('|||')[0].split(/\s[\/\|]\s/g);
              let bandlink = data.split('|||')[1].split(/\s[\/\|]\s/g);
              var band_col = band.map(
                (item, i) => '' + "<div class='grid_item'><div class='flex_item'>" +
                  "<a class='hreftext'>" +
                  item + "</a>" + "<div class='dropdown'>" +
                  maLink("bands/view/", bandlink[i]) + searchLink(item).replace(/\/spotify\"/g, '/artists"') +
                  '</div></div></div>');
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
                var genre = item
                  .replace(/(?<=[;|\),])\s|\s(?=with)/g, ' \n')
                  ;
                genre_col.push("<div class='Genre grid_item ts'><p class='flex_item fixed'>" +
                  genre + "</p><div class='flex_item ts fixed float'>" +
                  genre
                    .replace(/\/(?!Rock|.*?Metal)/g,', \n')
                    .replace(/(\S+(\/\S+)+)/g, '\n$1\n')
                    .replace(/(?<=br\>|(\n\s?)|\b)\n/g, '')
                  +
                  '</div></div>')

              });
              return tabLink("".concat(genre_col.join(''), ''));
            }
            return data;
          },
          width: '10%',
          targets: [4],
        },
        {
          render: (data, type, row) => {
            let reviewers = data.split('|||')[0];
            let range = data.split('|||')[1];
            let mean = data.split('|||')[2];
            let sd = data.split('|||')[3];
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
          // index
          render: (data, type, row) => {
            return "<a class='scores'>".concat(data, '')
          },
          targets: [-2],
        },
        {
          // continent
          render: (data, type) => {
            if (type === 'display') {
              return "<p class='continent'>".concat(data, '</p>');
            }
            return data;
          },
          width: '0%',
          targets: [-1],
        },
      ],
      language: {
        searchPlaceholder: "Search for albums or bands..",
        search: "_INPUT_",
        info: "( _START_ - _END_ ) / _TOTAL_ ",
        infoEmpty: "0 entry",
        infoFiltered: " [ Total: _MAX_ ]"
      },

      drawCallback: function (settings) {
        // rendering histograms
        var api = this.api();
        var coldata = api.column(8, { page: 'current' }).data();
        var score = coldata.map((item) => item = item.slice(8, -1).split(', ').map((item) => item == '0' ? item = 1 : parseInt(item)));
        var id = coldata.map((item) => item = item.slice(0, 4));
        for (var k = 0; k < id.length; k++) {
          Plotly.newPlot(id[k], [{
            x: score[k],
            type: 'histogram',
            xbins: { start: 1, end: 105, size: 10 },
            histnorm: 'percent',
            hoverlabel: { bgcolor: "rgba(0,0,0,0.8)" },
            marker: {
              color: '#000',
            }, hovertemplate: '<i>Ratings</i>: %{x}<br><i>Percent</i>: %{y:.2f}%<extra></extra>'
          }
          ], {
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
          }, { displayModeBar: false });
        };
      },
    });
  let table = $('.toplist').DataTable();
  // table.draw(); 
  table.on('xhr', function (e, settings, json, xhr) {
    var json = table.ajax.json();
    if (json) {
      //count 
      $('#update').text('Last updated on: ' + json.lastUpdate + '. ');
      $('#info').show().animate({ height: 'linear', opacity: 'easeOutBounce', }, "slow");
    }
  });
  $('#url-option').on('change', function () {
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
  layout();
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
    let year = Number(data[6].match(/\d{4}/i).toString());
    let genre = data[4].toLowerCase();
    let continent = data[9];
    let genres = $("#genre-options").val() || [];
    let regions = $("#region-options").val() || [];
    let years = $("#year-options").val() || [];
    let yearsMin = [];
    let yearsMax = [];
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
