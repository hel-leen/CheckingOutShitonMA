jQuery.fn.extend({
  check: function() {
    return this.each(function() {
      this.checked = true;
      this.selected = true;
    });
  },
  uncheck: function() {
    return this.each(function() {
      this.checked = false;
      this.selected = false;
    });
  },
});
var
  hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g),
  hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g),
  mobile = (navigator.userAgent.search(/mobile/gi) > -1),
  sScreen = window.matchMedia('(max-width: 767px)').matches,
  userLang = window.navigator.userLanguage || window.navigator.language,
  ajaxurl = window.location.href.toString().toLowerCase().match(/[\/\\]((?:.(?![\/\\]))+)\.html/)[1],
  deletedItem = ajaxurl.concat('_deleted'),
  savedItem = ajaxurl.concat('_saved');
if (!localStorage.getItem(savedItem)) {
  localStorage.setItem(savedItem, JSON.stringify({
    expire: 0,
  }));
}
savedData = JSON.parse(localStorage.getItem(savedItem));
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
const pageLayout = ((font1, font2, font3) => {
  if (!mobile) {
    $.fn.DataTable.ext.pager.numbers_length = 9;
    if (sScreen) {
      $(":root").css("font-size", font1);
    } else {
      $(":root").css("font-size", font2);
    }
  } else {
    $.fn.DataTable.ext.pager.numbers_length = 5;
    $(":root").css("font-size", font3);
  }
});
const uniq = (value, index, self) => self.indexOf(value) === index && !(value === '' || value == ' ' || value == '/' || value == null);
const partSort = ((x, y) => {
  var xp = x.toLowerCase(),
    yp = y.toLowerCase();
  return xp == yp ? 0 :
    xp < yp ? -1 :
    1;
});
const preShow = () => {
  $('.anchor').show().css({
    'display': 'flex'
  });
  $('.bottom').hide();
}
const initShow = () => {
  $('.anchor').hide();
  $('#del.btm').html('<span><i class="fas fa-trash" ></i></span>');
  $('#res.btm').html('<i class="fas fa-trash-restore" ></i>');
  $('.btm').css({'height':$('.btm').css('width')});
  $('.filterWrapper, #searchBox, #timecharts, .bottom')
    .removeClass('hideItem')
    .css({
      'display': 'grid',
      visibility: 'visible',
      opacity: .1
    }).animate({
      opacity: 1,
    }, 1000);
  $('#info').show().animate({
    height: 'linear',
    opacity: 'easeOutBounce',
  }, "slow");
}
const loadData = ((data, callback, settings) => {
  const showCallback = data => {
      callback(data);
      $('#update').text('Last updated on: ' + data.lastUpdate + ' ');
      $("#count").text('Total records: ' + data.recordsTotal + ' ');
    }
    // download and save to localStorage
  if (moment.now() >= savedData.expire) {
    $.getJSON(ajaxurl)
      .done(function(data) {
        showCallback(data);
        data = {
          ...data,
          expire: moment.now() + 60 * 60  * 1000 * 24 * data.TTL,
        };
        localStorage.setItem(savedItem, JSON.stringify(data));
      })
  } else {
    data = savedData;
    showCallback(data);
  }
});
const modifyItems = (api) => {
  // localStorage
  var getDeletedItem = localStorage.getItem(deletedItem);
  if (getDeletedItem != (undefined || null || '0')) {
    $('.btm:nth-last-child(1),.btm:nth-last-child(2)').css({
      'visibility': 'visible'
    });
    var selected = getDeletedItem.split(',').join('|');
    api.columns(0).search('^('.concat(selected, ')'), true).rows({
      search: 'applied'
    }).remove().column(0).search('').draw();
  };
  //delete entries in selected tr(s) 
  $('#del.btm,.delItems').click(function() {
    var selected = api.rows('.selected').data().map((d, j) => {
      return d = d[0].split(/(?<=\d)\|\|\|/g)[0];
    }).toArray();
    $('.btm:nth-last-child(1),.btm:nth-last-child(2)').css({
      'visibility': 'visible'
    });
    if (getDeletedItem != (undefined || null || '0')) {
      var storedItems = getDeletedItem.split(',');
      localStorage.setItem(deletedItem, storedItems.concat(selected));
    } else {
      localStorage.setItem(deletedItem, selected);
    }
    api.rows('.selected').remove().draw(false);
  });
  //restore deleted entries
  $('#res.btm,.resItems').click(function() {
    localStorage.setItem(deletedItem, [0]);
    location.reload();
  });
};
const createFilter = (table, columns) => {
  var input = '<input type="text" class="search"/><span class="clear fa fa-times-circle"></span>';
  input = $(input).on("keyup click", function() {
    var
      iclear = $(this).parent().children(".clear"),
      ivalue = $(this).parent().children("input");
    if (ivalue.val()) {
      iclear.show();
    }
    if ($(this).filter(".clear").length > 0) {
      ivalue.val('');
      ivalue.focus();
      iclear.hide();
    }
    table.draw();
  });
  $.fn.dataTable.ext.search.push(function(
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
const searchBox = api => {
  $("#searchInput").append(createFilter(api, ['2', '1']));
  $("#searchInput input.search").attr('placeholder', 'Search for albums or bands..');
  $("#search-fields").on("keyup change", function searchFields(e) {
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
    api.columns(1).search('').columns(2).search('').columns(3).search('').columns(6).search('').draw();
    $("#searchInput").empty().append(createFilter(api, searchFields))
      .children('input.search').val(searchValue)
      .attr('placeholder', 'Search for '.concat(searchCols, '..'));
  });
}
const defaultParams = {
  dom: 'rt<"bottom"<<"#res.btm.l"><"#del.btm.l"> i<"#del.btm.r"><"#res.btm.r"> >p>',
  autoWidth: false,
  fixedHeader: true,
  scrollCollapse: true,
  orderCellsTop: false,
  deferRender: true,
  lengthMenu: [50, 100, 200, 400],
  search: {
    regex: true,
    smart: true,
  },
  stateSave: true,
  stateDuration: 60 * 60 * 24 * 7,
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
  ajax: loadData
}
$(function() {
  $('.dataTables').on('click', '.prev', function() {
    $(this).parent().prevAll('.group').length > 0 ?
      $('html,body').animate({
        scrollTop: $(this).parent().prevAll('.group').offset().top - $(".dataTables_filter").height()
      }, 600) :
      $('html,body').animate({
        scrollTop: $(this).parent().offset().top - $(".dataTables_filter").height()
      }, 600)
  });
  $('.dataTables').on('click', '.next', function() {
    $(this).parent().nextAll('.group').length > 0 ?
      $('html,body').animate({
        scrollTop: $(this).parent().nextAll('.group').offset().top - $(".dataTables_filter").height()
      }, 600) :
      $('html,body').animate({
        scrollTop: $(this).parent().nextAll().last().children().last().offset().top - $(".dataTables_filter").height()
      }, 600)
  });
  $('.toggle ').click(function() {
    $(this).parent().children('.hideItem, .hideItem>*').toggle({
      duration: 500,
      height: "easeInBounce",
      display: "easeInBounce"
    }).css('display', 'grid');
    $(this).children('.fa-chevron').toggleClass("fa-chevron-circle-right fa-chevron-circle-down");
    $(this).children('.fa-caret').toggleClass("fa-caret-right fa-caret-down");
  });
  //active link after click second time (for mobile devices only)
  $('.dataTables').on('click', '.dropdown,.float', function activeFloat() {
    $(this).toggleClass('actived');
  });
  //double click to select tr(s) 
  $('.dataTables').on('dblclick', ' tr:not(.group)', function dblClick(e) {
      $(this).toggleClass('selected');
      if ($('.selected').length > 0) {
        $('.btm:nth-last-child(2)').css({
          'visibility': 'visible'
        });
      } else {
        $('.btm:nth-last-child(2)').css({
          'visibility': 'hidden'
        });
	  }
    })
    .on('dblclick', 'td *', function noDblClick(e) {
      e.stopPropagation();
    });

  $('.reload').click(function() {
    localStorage.setItem(savedItem, JSON.stringify({
      expire: 0,
    }));
    location.reload();
  });
  $('.filterSection .clear').click(function() {
    var filters = $(this).parent();
    var cols = filters.attr('class').replace(/.*(?=\d)/g, '');
    filters.children('select').children('option').prop('selected', false);
    filters.children('#datepicker').val('');
  });
  $('#all, #reset, #Reset').click(function() {
    $('select option').uncheck();
    $('#searchBox option').check();
    $("input[type='checkbox']").uncheck();
    $("input[type='text']").val('');
  });
  $('#reset, #Reset').click(function() {
    $('#searchBox option:not(:eq(0)):not(:eq(0))').uncheck();
    $('#genre-options option:not(:eq(-1))').check();
  });
});
$(document).on('click', '.paginate_button', function() {
  $('body,html').animate({
    scrollTop: $('.dataTables tbody').offset().top - $(".dataTables_filter").height() - 8,
  }, 800);
});

String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/\S*?\b[\p{L}']+/gu, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With', 'Von'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
      function(txt) {
        return txt.toLowerCase();
      });
  uppers = ['osdm', 'usbm', 'us', 'uk', 'ny', 'nz', "'n", "'n'", 'dna'];
  var numbers = this.match(/((?<=\b)M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})(?=\b))/gi);
  if (numbers != null) {
    numbers = numbers.filter(v => v != '');
    uppers = uppers.concat(numbers);
  }
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'gi'),
      uppers[i].toUpperCase());
  return str;
}