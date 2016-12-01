$(function () {
    
    $("#profitfromaccounts").DataTable( {
        "processing": false,
        "serverSide": false,
        "ajax": {
            "url": "/bankaccounts/getaccountsprofit",
            "type": "POST"
        }, "columns": [
            { "data": "id" },
            { "data": "desc" },
            { "data": "owner" },
            { "data": "bank" },
            { "data": "profit" },
            { "data": "date" }
            ],
            "order": [[ 5, "desc" ]]
    } );    
        
    $("#profitfromaccounts tbody").on( "click", "tr", function () {
        window.location.href = "/bankaccount/new/" + $(this).find("td:first")[0].innerText;
    });
});
