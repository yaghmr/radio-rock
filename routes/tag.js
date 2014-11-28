var express = require('express');
var router = express.Router();
var request = require('request');
var $ = require('cheerio');


router.get('/:tag/random/track', function (req, res, next) {

  request(domain + "tag/" + req.params.tag, function (error, response, html) {
    console.log('albums')
    var albums = []
    var trackInfo = []
    var track = {}
    var random_track = {}

    if (!error && response.statusCode == 200) {
      var parsedHTML = $.load(html)

      parsedHTML('.item_list .item').map(function(i, link) {
        var href  = $(link).children('a').attr('href')
        var title = $(link).find('.itemtext').text()
        var band  = $(link).find('.itemsubtext').text()
        var art   = $(link).find('.art').attr('src')

        albums.push(new Album(band, title, href, art))
      })
    }

    var random_album = albums[Math.floor(Math.random() * albums.length)]
    console.log(random_album)

    request(random_album._path, function (error, response, html) {
      console.log('track')

      var parsedHTML = $.load(html)
      var second_script = parsedHTML(('#pgBd script'))[1]
      var html_script = 'var Control = {registerController: function(){}}; Control.registerController( "/", {});' + $(second_script).html()

      try { eval(html_script) } catch(e) { }

      trackInfo = TralbumData.trackinfo
      if(trackInfo.length > 0){
        random_trackinfo =  trackInfo[Math.floor(Math.random() * trackInfo.length)]

        if(random_trackinfo.streaming !== null || random_trackinfo.file !== null){
          random_track = new Track(random_album._band, random_trackinfo.title, random_album._title, random_trackinfo.file['mp3-128'])
        }
      }

      console.log(random_track)
      res.json(random_track)
    })
  })
})


router.get('/:tag/track', function (req, res, next) {
  request('http://127.0.0.1:3000/tag/' + req.params.tag + '/random/track').pipe(res)
})

module.exports = router;



