var current_tag = {};
var paused = false;


$( document ).ready(function() {
  var audio = document.getElementById('player');
  audio.setAttribute("type", "hidden");

  $(document).keydown(function(e) {
    var unicode = e.charCode ? e.charCode : e.keyCode;
    // right arrow
    if (unicode == 39) {
      if(current_tag._name !== undefined){
        next();
      }
    // space bar
    } else if (unicode == 32) {
      if(paused){
        paused = false;
        audio.play();
      } else {
        paused = true;
        audio.pause();
      }
    } else if (unicode == 38) {
      var current_volume = audio.volume;
      if(current_volume < 1){
        audio.volume = current_volume + 0.1;
      }
    } else if (unicode == 40) {
      var current_volume = audio.volume;
      if(current_volume > 0.1){
        audio.volume = +current_volume - 0.1;
      }
    }
  })

  function next(argument) {
    $('audio source').first().remove();
    var next_track = $('audio source').first().attr("src");

    if(next_track !== undefined){
      run(next_track);
      addTrack(current_tag._path);
    } else {
      addTrack(current_tag._path);
    }
  }

  function run(next_url) {
    audio.src = next_url;
    audio.pause();
    audio.load();
    audio.play();
  }


  audio.addEventListener('play', function(){
    var title = $('audio source').first().attr("data-title");
    var band = $('audio source').first().attr("data-band");
    var album = $('audio source').first().attr("data-album");

    var info_string = "On Air: <strong>" + title + "</strong> by <strong>" + band + "</strong> from the album <strong>" + album + "</strong>";
    $("#info").html(info_string);

    $("#progressBar").show();
  });

  audio.addEventListener('ended', function(){
    next();
  });


  $.ajaxSetup({ cache: false });
  function addTrack(tag) {
    $.getJSON( tag + '/track', function( data, status, xhr ) {
      //console.log(data);
      if(data._path !== undefined){
        $("#player").append('<source data-title="' + data._title + '" data-band="' + data._band + '" data-album="' +  data._album +'" src="' + data._path + '" type="audio/mp3">')
      }
    });
  }

  setInterval(function(){
    var duration = parseInt(audio.duration, 10);
    $("#progressBar").attr("max", duration);

    var current_time = parseInt(audio.currentTime, 10);
    $("#progressBar").attr("value", current_time);
  },3000);


  $(function() {
    var cache = {};
    $( "#tag" ).autocomplete({
      minLength: 2,
      source: function( request, response ) {
        var term = request.term;
        if ( term in cache ) {
          response( cache[ term ] );
          return;
        }

        $.getJSON( '/tags', request, function( data, status, xhr ) {
          var filteredData = $.grep(data, function (element, index) {
            return element._name.indexOf(term) != -1;
          });
          if(filteredData.length === 0){
            $( "#info" ).html("No results for <strong>" + request.term + "</strong>. Search again!");
          }
          cache[ term ] = filteredData;
          response( filteredData );
        });
      },
      select: function( event, ui ) {
        $( "#tag" ).val( ui.item._name );
        current_tag = ui.item;

        $("#info").html("Loading your first <strong>" + current_tag._name + "</strong> track...");
        $('audio source').remove();
        addTrack(current_tag._path);
        addTrack(current_tag._path);

        return false;
      },
      close: function(){
        $(this).blur();
      }
    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" ).append( item._name ).appendTo( ul );
    };
  });

});