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
 ajaxurl = window.location.href.toString().toLowerCase().match(/[\/\\]((?:.(?![\/\\]))+)\.html$/)[1],
 deletedItem = ajaxurl.concat('deleted');
const uniq = (value, index, self) => self.indexOf(value) === index && !(value === '' || value == ' ' || value == '/' || value == null);
const partSort = ((x, y) => {
  var xp = x.toLowerCase(),
    yp = y.toLowerCase();
  return xp == yp ? 0 :
    xp < yp ? -1 :
    1;
});
let hreftext = new RegExp(/(?<=\>).*(?=\<\/a\>)/g),
  hreflink = new RegExp(/(?<=\<a\shref\=\")\/.*(?=\"\>)/g);
const tabLink = links => '' + links.replace(/"\>/g, '" target="_blank" rel="noopener noreferrer">');
 
var
  mobile = (navigator.userAgent.search(/mobile/gi) > -1),
  sScreen = window.matchMedia('(max-width: 767px)').matches;
 
String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/\S*?\b[\p{L}']+/gu, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With', 'Von'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
      function(txt) {
        return txt.toLowerCase();
      });
  uppers =['osdm','usbm','us','uk','ny',"'n","'n'",'dna'];
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
      height: "easeInBounce"
    }).css('display', 'grid');
    $(this).children('.fa-chevron').toggleClass("fa-chevron-circle-right fa-chevron-circle-down");
    $(this).children('.fa-caret').toggleClass("fa-caret-right fa-caret-down");
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
