var express = require('express');
var router = express.Router();
var request = require('request');
var $ = require('cheerio');


/*
 * GET tags.
 */
router.get('/', function (req, res) {
  console.log('tag')

  request(domain + "tags/", function (error, response, html) {
    var tags = []

    if (!error && response.statusCode == 200) {
      var parsedHTML = $.load(html)

      parsedHTML('#tags_cloud .tag').map(function(i, link) {
        var href = $(link).attr('href')
        var name = $(link).text()

        tags.push(new Tag(name, href))
      })
    }

    console.log('tag OK')
    res.json(tags)
  })
});



/*
 * GET related tags.
 */
router.get('/related/:tag', function (req, res, next) {
  console.log('tags related')

  request(domain + "tag/" + req.params.tag, function (error, response, html) {
    var related_tags = []

    if (!error && response.statusCode == 200) {
      var parsedHTML = $.load(html)

      parsedHTML('.related_tag_cloud .related_tag').map(function(i, link) {
        var href = $(link).attr('href')
        var name = $(link).text()

        related_tags.push(new Tag(name, href))
      })
    }
    res.json(related_tags)
  })
})

module.exports = router;