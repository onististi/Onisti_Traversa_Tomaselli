var express = require('express');
var router = express.Router();
const SearchController = require('../controllers/SearchController');

router.get('/api/search', SearchController.search);

module.exports = router;