$(function () {
    
    $("#activedeposits").DataTable( {
        "processing": false,
        "serverSide": false,
        "ajax": {
            "url": "/deposit/getactivedeposits",
            "type": "POST"
        },
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1 ');
                },
                "className": "dt-right",
                "targets": 5
            }
        ],
        "columns": [
            { "data": "id" },
            { "data": "title" },
            { "data": "owner" },
            { "data": "bank" },
            { "data": "perc" },
            { "data": "amount" },
            { "data": "startDate" },
            { "data": "endDate" }
            ],
            "order": [[ 7, "asc" ]]
    } );
    
        $("#historicdeposits").DataTable( {
        "processing": false,
        "serverSide": false,
        "formatNumber": function ( toFormat ) {
    return toFormat.toString().replace(
      /\B(?=(\d{3})+(?!\d))/g, "'"
        );},
        "ajax": {
            "url": "/deposit/gethistorydeposits",
            "type": "POST"
        },
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1 ');
                },
                "className": "dt-right",
                "targets": 5
            }
        ], "columns": [
            { "data": "id" },
            { "data": "title" },
            { "data": "owner" },
            { "data": "bank" },
            { "data": "perc" },
            { "data": "amount" },
            { "data": "endDate" },
            { "data": "profit" }
            ],
            "order": [[ 6, "desc" ]]
    } );
 
    $("#activedeposits tbody").on( "click", "tr", function () {
        window.location.href = "/deposit/new/" + $(this).find("td:first")[0].innerText + "/end";
    });
    
    $("#historicdeposits tbody").on( "click", "tr", function () {
        window.location.href = "/deposit/new/" + $(this).find("td:first")[0].innerText;
    });
});
