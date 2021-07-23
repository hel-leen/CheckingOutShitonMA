// let today = new Date();
let today = moment().subtract(0, 'days').format('YYYY-MM-DD');
var thisweek;
if (moment().day() > 5) {
    thisweek = moment().day(5).subtract(7, 'days').format('YYYY-MM-DD');
} else {
    thisweek = moment().day(5).subtract(0, 'days').format('YYYY-MM-DD');
}
// today. setHours(new Date().getUTCHours()- 36);  
console.log(moment().day());

function layoutFunction() {
    if (($(window).width()) < 800) {
        // $( "tr>td, tr>#tableHTML_header_1" ).wrap( "<div class='new'></div>");  
        $("<h3>By release date</h3>").insertBefore(".new>#tableHTML_header_1:nth-child(1)");
    } else {
        // $( ".new>td" ).unwrap();  
        $(".new h3").remove();
    }
}
$(function() {
    $("<small>Last updated on " + moment().subtract(1, 'days').format('YYYY-MM-DD') + " UTC.</small>").appendTo("#date");
    $("#datepicker").val(thisweek);
    $('#datepicker').dtDateTime();
    $('.release_info').DataTable({
        stateSave: true,
		"stateDuration": 60 * 60 * 6,
        "stateSaveParams": function(settings, data) {
            data.order = [
                [9, "asc"]
            ];
            // data.search.search = "";  
        },
        // "order": [[ 9, "asc" ]],  
		// "pagingType": "simple ",
        "lengthMenu": [50, 100, 200, 400, "All"],
        "columnDefs": [{
                "targets": [0, 1],
                "searchable": false,
                "sorting": false
            },
            {
                render: function(data, type) {
                    if (type === 'display') {
                        switch (data) {
                            case 'NA':
                                data = ' ';
                                break;
                        }
                        return data;
                    }
                    return data;
                },
                "targets": [10, 8]
            },
            {
                render: function(data, type) {
                    if (type === 'display') {
                        switch (data) {
                            case 'NA':
                                data = 'Independent';
                                break;
                        }
                        return data;
                    }
                    return data;
                },
                "targets": [6]
            },
        ],
        "search": {
            "regex": true
        },
        "autoWidth": false,
        language: {
            searchPlaceholder: "Search for albums or bands..",
            search: "_INPUT_",
			info:           "( _START_ - _END_ ) / _TOTAL_ ",
			infoEmpty:      "0 entry",
			infoFiltered:   " [ Total: _MAX_ ]"
            // searchBuilder: {
                // add: '+',
                // deleteTitle: 'Delete',
                // data: 'date',
                // leftTitle: 'Left',
                // rightTitle: 'Right',
                // title: {
                    // 0: ' Date filter',
                    // 1: ' Date filter (%d)',
                    // _: ' Date filters (%d)'
                // },
                // value: 'Date pickers',
            // }
        },
        // buttons: [
            // 'searchBuilder'
        // ],
        // dom: 'Qlfrtip',  
        // searchBuilder: {  
        // preDefined: {  
        // criteria:[  
        // {  
        // condition: '>',  
        // data: 'ReleaseDate',  
        // value: [thisweek]  
        // }  
        // ],  
        // logic: 'AND'  
        // },  
        // columns: [9]  
        // }  
    });
    setTimeout(function() {
        table.draw(false);
        $('.filterSection').css({
            opacity: 0.0
        }).animate({
            opacity: 1.0,
            "height": "fit-content"
        });
    }, 1000);
    setTimeout(function() {
        table.draw(false);
        $('.dataTables_wrapper').css({
            opacity: 0.0
        }).animate({
            opacity: 1.0
        });
    }, 1500);
    setTimeout(function() {
        $('.release_info,#date').animate({
            height: "toggle",
            opacity: "toggle"
        }, "slow");
    }, 2500);
    let table = $('.release_info').DataTable();
    $('.release_info tbody').on('dblclick', 'tr', function() {
        $(this).toggleClass('selected');
    });
    $('#delete_button').click(function() {
        table.rows('.selected').remove().draw(false);
    });
    $('.filter,.genrefilter,.paginate_button, .filter-holder,#reset').change(function() {
        table.draw();
    });
    $(".note>b,.note>a").click(function() {
        $(".note>b i").toggleClass("fa-caret-right fa-caret-down");
        $(".note>a").animate({
            height: "toggle",
            opacity: "toggle"
        }, "fast");
        $(".note>div:not(:nth-last-of-type(0))").animate({
            height: "toggle",
            opacity: "toggle"
        }, "fast");
    });
    $(window).resize(function() {
        table.draw(false);
    });
    $('.genrefilter').first().change(function() {
        if ($(this).is(':not(:checked)') && $('.genrefilter').length > 0) {
            alert('I hope you improve your taste');
            $("#black").attr("class", "filter");
        }
    });
	$.fn.DataTable.ext.pager.numbers_length = 5;
});
$(document).on('click', '.paginate_button', function() {
    $("body,html").animate({
        scrollTop: $("table thead").offset().top - 5
    }, 800);
});
$(document).on('click', '#reset, #Reset', function() {
    // $('.release_info').DataTable().draw();  
    // $(this).animate({opacity: 'toggle'}).animate({ opacity: 'toggle'});  
    $('#Fulllength').prop('checked', false);
    $('#Reissue').prop('checked', true);
    $('#genre-options option[value=black]').prop('selected', true);
    $('#genre-options option[value=death]').prop('selected', true);
    $('#genre-options option:eq(2)').prop("selected", false);
    $("#datecondition").val("After");
    $("#datepicker").val(thisweek);
    $('.release_info').DataTable().column('9:visible').order('asc').draw(true);
});
$(document).on('click', '#datecondition', function() {
    if ($(this).val() == "After") {
        $(this).val("Before");
        $(this).css("text-shadow", "0px 0px 1px #d99");
        $('.release_info').DataTable().column('9:visible').order('desc').draw(true);
    } else {
        $(this).val("After");
        $(this).css("text-shadow", "0px 0px 1px #9b9");
        $('.release_info').DataTable().column('9:visible').order('asc').draw(true);
    }
});
$(document).on('click', '#today', function() {
    // $(this).animate({opacity: 'toggle'}).animate({ opacity: 'toggle'});  
    $("#datepicker").val(today);
    $('.release_info').DataTable().draw();
});
$(document).on('click', '#dateclear', function() {
    $("#datepicker").val("");
    $('.release_info').DataTable().draw();
});
$.fn.dataTable.ext.search.push(
    function(settings, data, dataIndex) {
        let genre = data[5].toLowerCase();
        let type = data[7];
        let date = data[9];
        let version = data[10];
        let genres = $("#genre-options").val() || [];
        var dateset;
        if ($("#datecondition").val() == "After") {
            dateset = eval(date >= $("#datepicker").val());
        } else {
            dateset = eval(date < $("#datepicker").val());
        }
        if (($('#Fulllength').is(':checked') && type.indexOf('Full') < 0) || ($('#Reissue').is(':checked') && version.indexOf('NA') < 0)) {
            return false;
        }
        return (genre.search("(".concat(genres.join("|"), ")")) > -1 && dateset);
        // return true;  
    }
);

$(window).resize(function() {
    // layoutFunction();  
})
window.onscroll = (function() {
    if ($(window).width() >= 800) {
        let scrollY = $(window).scrollTop();
        if (scrollY > $(window).height() * 0.4 && $('tr:hover').length > 0) {
            $("#header").css("font-size", "1.5em");
        } else {
            $("#header").css("fontSize", "2em");
        }
    }
});
