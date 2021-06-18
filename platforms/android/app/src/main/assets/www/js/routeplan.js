var form = '<div class="list-group-item list-group-item-info">';
form += ' <label>Year: '+moment().get('year')+'</label>';
form += ' <label>Week: '+moment().week()+'</label>';
form += ' <label>This Month: '+moment().month()+'</label>';
form += ' <label>Date: '+getTodaysDate()+'</label>';
form += '</div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Monday</label>';
form += ' <select id="Monday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Tuesday</label>';
form += ' <select id="Tuesday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Wednesday</label>';
form += ' <select id="Wednesday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Thursday</label>';
form += ' <select id="Thursday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Friday</label>';
form += ' <select id="Friday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Saturday</label>';
form += ' <select id="Saturday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <div class="form-group list-group-item">';
form += ' <label>Sunday</label>';
form += ' <select id="Sunday" name="outlets[]" class="form-control multi_select" multiple>';
form += ' </select>';
form += ' </div>';
form += ' <input type="hidden" id="week" value="'+moment().week()+'" class="form-control" >';
form += ' <input type="hidden" id="month" value="'+thisMonth()+'" class="form-control" >';
form += ' <input type="hidden" id="curryear" value="'+thisYear()+'" class="form-control" >';
form += ' <input type="hidden" id="dbitemid" value="0" class="form-control" >';

$(document).ready(function() {
    fetchRoutePlan();
    $('#form-modal').on('show.bs.modal', function (event) {
        var modal = $(this);
        // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.

        var button = $(event.relatedTarget); // Button that triggered the modal
        var bform = button.data('form');
        var viewtype = button.attr('id');
        var dbid = button.data('dbid');
        console.log('our modal opened');

        bindPlantoForm(dbid,function(table){
            console.log('binding data to form');
            console.log('table is '+table);
            if (table === null){
                modal.find('.modal-body .list-group #form-holder').html(form);
                fetchOutletsForSelect(function(options){
                    $("select.multi_select").html(options).multiselect();
                    //$("select.multi_select").multiselect();
                })
            }
            else {
                modal.find('.modal-body .list-group #form-holder').html(table);
            }
        });
        $('#displaySubmit').on('click', function () {
            console.log('trying to save weekly plan');
            var dbitemid = $('#dbitemid').val();
            if (dbitemid == 0){
                insertPlan();
            }
            else {
                updatePlan();
            }
        });

    });

    $('#form-modal').on('hidden.bs.modal', function (e) {
        fetchRoutePlan();
    })
    $('#btnsyncObj').on('click',function(){
        syncTasks();
    })
    $('#btnsyncFetch').on('click',function(){
        fetchWeeklyPlan();
        console.log('clicked');
    })
});

function bindPlantoForm(dbid,callback){
    if (dbid == 0){
        var table = null;
        if (callback) callback(table);
    }
    else {
        var q = "SELECT id,routeplan FROM weekly_planner WHERE id = '"+dbid+"' ";

        db.transaction(function (t) {
            t.executeSql(q, null, function (t, data) {
                var dbitem = data.rows.item(0);
                var routeplan = JSON.parse(dbitem.routeplan);
                var pnum = routeplan.items.length;
                var table = '';
                table += '<div class="list-group-item list-group-item-info">';
                table += ' <label>Year: '+thisYear()+'</label>';
                table += ' <label>Week: '+moment().week()+'</label>';
                table += ' <label>This Month: '+thisMonth()+'</label>';
                table += ' <label>Date: '+getTodaysDate()+'</label>';
                table += '</div>';
                table += ' <div class="form-group list-group-item list-group-item-info">';
                table += ' <label>Editing Weekly Plan:</label>';
                table += ' </div>';
                for (var i = 0;i<pnum;i++) {
                    var p = routeplan.items[i]; // <--- array!!
                    // create a table row
                    table += ' <div class="form-group list-group-item">';
                    table += ' <label>'+p.name+'</label>';
                    table += ' <select id="'+p.name+'" name="outlets[]" class="form-control multi_select" multiple>';
                    // How do we bind the outlets here????
                    table += ' </select>';
                    table += ' </div>';
                }
                table += ' <input type="hidden" id="week" value="'+moment().week()+'" class="form-control" >';
                table += ' <input type="hidden" id="month" value="'+thisMonth()+'" class="form-control" >';
                table += ' <input type="hidden" id="curryear" value="'+thisYear()+'" class="form-control" >';
                table += ' <input type="hidden" id="dbitemid" value="'+dbid+'" class="form-control" >';
                if (callback) callback(table);
            });
        });
    }
}
function fetchRoutePlan(){
    var week = moment().week();
    var month = thisMonth();
    var year = thisYear();
    var q = "SELECT * FROM weekly_planner WHERE week = '"+week+"' AND month = '"+month+"' AND year = '"+year+"'";

    db.transaction(function (t) {
        t.executeSql(q, null, function (t, data) {
            //console.log(q);
            var found = data.rows.length;

            if (found >= 1){
                var dbitem = data.rows.item(0);
                //console.log(item.brands);
                var routeplan = JSON.parse(dbitem.routeplan);
                //console.log(routeplan);
                var num = routeplan.items.length;
                //console.log(brandnum);
                var pl;
                //pl = '<a href="#" class="list-group-item" data-toggle="modal" data-target="#form-modal" data-form="competitor" data-dbid="'+dbitem.id+'" id="edit">';
                pl = '<a href="#" class="list-group-item">';

                for (var i = 0;i<num;i++) {
                    pl += '<ul class="list-group">';
                    var item = routeplan.items[i]; // items <--- array,,,,, item is an object
                    //console.log(item);
                    var outlets = item.outlets;
                    pl += '<h4>'+item.day+'</h4>';
                    // loop through the outlets and extract them one by one
                    for (var x = 0;x<outlets.length;x++) {
                        var outlet = outlets[x]; // outlets <--- array,,,,, outlet is an object
                        //console.log(outlet);
                        pl += '<li class="list-group-item">'+outlet.name+'</li>';
                    }

                    pl += '</ul>';
                }

                pl += '</a>';
                $('article#artroute').html(pl);
            } // end if found
            else {
                var defaultview = '<a href="#" class="list-group-item" data-toggle="modal" data-target="#form-modal" data-form="competitor" data-dbid="0" id="new">';
                //defaultview += '<h4>Competitor Prices Index</h4>';
                defaultview += '<p>No plan for this week found</p>';
                defaultview += '<button class="btn btn-success"> Tap here to add one</button>';
                defaultview += '</a>';

                $('article#artroute').html(defaultview);
            }
        });
    });

}
function insertPlan(){
    var routeplan = {};
    var items = [];
    // select[name='outlets[]']
    $('form#formdisplayinput').find("select.multi_select").each(function(i, field) {
        var day = $(field).attr('id');
        var outlets = [];
        var dayplan = {};
        var multipleValues = $(field).val() || [];

        //loop through all the selected options to get their attributes
        $(field).find('option:selected').each(function(){
            var name = $(this).data('name');
            //create an object
            var outlet = {};
            outlet.id = $(this).attr('value');
            outlet.name = $(this).data('name');
            outlet.server_id = $(this).data('server_id');
            //console.log(outlet);
            outlets.push(outlet);
        });
        dayplan.day = day;
        dayplan.outlets = outlets;
        //console.log(dayplan);
        items.push(dayplan);
    });
    routeplan.items = items;
    var routedata = JSON.stringify(routeplan);
    //console.log(routedata);
    //console.log(routeplan);

    var month = document.getElementById("month").value;
    var approved = '0';
    var submitter = username;
    var year = document.getElementById("curryear").value;;
    var week = document.getElementById("week").value;;
    var inputdate = getTodaysDate();
    var coords = userlocation;

    db.transaction(function(st) {
        //st.executeSql('DROP TABLE IF EXISTS weekly_planner');
        st.executeSql('CREATE TABLE IF NOT EXISTS weekly_planner (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, coords VARCHAR, routeplan LONGTEXT, status VARCHAR,submitter VARCHAR, inputdate VARCHAR, week VARCHAR, month VARCHAR, year VARCHAR, modified TEXT, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,last_sync TEXT DEFAULT "none")');
        st.executeSql("INSERT INTO weekly_planner(coords,routeplan,status,submitter,inputdate,week,month,year) values (?,?,?,?,?,?,?,?)",[coords,routedata,approved,submitter,inputdate,week,month,year], alertSuccess);
    },onError,onReadyTransaction);
}
function fetchOutletsForSelect(callback){
    var q = "SELECT id,server_id,name FROM stores";
    db.transaction(function (t) {
        t.executeSql(q, null,function (t, data) {
            var sl = '';
            for (var i =0;i<data.rows.length;i++) {
                sl += '<option value="'+data.rows.item(i).id+'" data-name="'+data.rows.item(i).name+'" data-server_id="'+data.rows.item(i).server_id+'" >'+data.rows.item(i).name+'</option>';
            }
            callback(sl);
        });
    });
}

/*function fetchWeeklyPlan(){
    var q = "SELECT * FROM data_tl_daily_planner";
    db.transaction(function (t) {
        t.executeSql(q, null,function (t, data) {
          //console.log(data.length);
            var sl = '';
            for (var i =0;i<data.rows.length;i++) {
                sl += '<option value="'+data.rows.item(i).id+'" data-name="'+data.rows.item(i).name+'" data-server_id="'+data.rows.item(i).server_id+'" >'+data.rows.item(i).name+'</option>';
            }
            callback(sl);
        });
    });
}*/

function syncTasks(){
  // fetch the items from database and sync to server
  var q = "SELECT * FROM weekly_planner WHERE last_sync = 'none'";

  db.transaction(function (t) {
    t.executeSql(q, null, function (t, data) {
      var found = data.rows.length;
      var msg ='';
      var items = [];
      var jsonitems = {};
      var jsondata;
      if (found >= 1) {
          for (var i =0;i<found;i++) {
            var obj = data.rows.item(i);
            //console.log(obj);
            items.push(obj);
          }
          jsonitems['routeplan'] = items;
          jsondata = JSON.stringify(jsonitems);
          //console.log(items);
          //console.log(jsondata);
          // ajax send this
          ajaxUpload(jsondata);

      }
      else{
         msg += '<p>You do not have any unsynced weekly plans</p>';
      }

      $('.syncmessage').html(msg);
    });
  });
}
function ajaxUpload(jsondata){
   $.ajax({
        url : ServerURI+'/api/postdata.php?info=weekly_planner&username='+username,
        type : 'POST',
        data : jsondata,
        beforeSend : function(xhr){
            console.log('Start');
            $('.ajax_request').removeClass('hide');
        },
        error : function(xhr, status, error){
            console.log(xhr.responseText+ ' | ' +status+ '|' +error);
            $('.syncmessage').html('There was an error uploading weekly plan');
        },
        complete : function(xhr, status){
            console.log('End');
            $('.ajax_request').addClass('hide');
        },
        success : function(result, status, xhr){
            $('.syncmessage').html('success');
            //console.log(result);
            if (result instanceof Object){
              //console.log(result);
              $('.syncmessage').html(result.message);
              if(result.status == 'OK'){
                // update the syncdate of synced items
                updateSyncDates(result.synctime,result.items_synced)
              }
            }
            // we did not get a json response
            else {
              $('.syncmessage').html('The response message could not be understood');
            }

        }

    });

}
function updateSyncDates(lastsync,itemids){
  // check the length of itemids
  if (itemids.length){
      db.transaction(function(st) {
          for (var i = itemids.length - 1; i >= 0; i--) {
            console.log(itemids[i]);
            console.log(lastsync);
            st.executeSql("UPDATE weekly_planner SET last_sync = '"+lastsync+"' WHERE id = '"+itemids[i]+"'",null, alertSuccess);
          };
      },onError,function(){
        //document.location.reload('true');
      });
  }

}
