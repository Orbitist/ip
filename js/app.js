var main = function(vis, layers) {
  var vizjson = 'https://orbitist.cartodb.com/api/v2/viz/6686c0e0-de33-11e5-8b89-0ecfd53eb7d3/viz.json';
  var options = {
    shareable: false,
    title: false,
    description: false,
    search: false,
    tiles_loader: true
  };
  cartodb.createVis('map', vizjson, options)
  .done(onVisCreated)
  .error(function(err) { alert('error!'); });
};

var onVisCreated = function(vis, layers) {
  var sublayer = layers[1].getSubLayer(0);

  sublayer.infowindow.set({
    template: document.getElementById('infowindowTemplate').innerHTML
  });

  var originalSQL = sublayer.getSQL();
  var originalCartoCSS = sublayer.getCartoCSS();
  var widgets = new Widgets();
  
    addWidget(widgets, {
    title: 'NDVI Ranges',
    filters: [
      {
        title: "<0 NDVI",
        condition: "ndvi < 0"
      },
      {
        title: "0 - 0.1 NDVI",
        condition: "ndvi >= 0 AND ndvi <= 0.1"
      },
      {
        title: "0.1 - 0.2 NDVI",
        condition: "ndvi >= 0.1 AND ndvi <= 0.2"
      },
      {
        title: "0.2 - 0.3 NDVI",
        condition: "ndvi >= 0.2 AND ndvi <= 0.3"
      },
      {
        title: "0.3 - 0.4 NDVI",
        condition: "ndvi >= 0.3 AND ndvi <= 0.4"
      },
      {
        title: "0.4 - 0.5 NDVI",
        condition: "ndvi >= 0.4 AND ndvi <= 0.5"
      }
    ]
  });
  
    addWidget(widgets, {
    title: 'Sensor',
    filters: [
      {
        title: "Sensor #1",
        condition: "sensor = 1"
      },
      {
        title: "Sensor #2",
        condition: "sensor = 2"
      }
    ]
  });
  
    addWidget(widgets, {
    title: 'Elevation',
    filters: [
      {
        title: "210 - 220",
        condition: "elevation >= 210 AND elevation <= 220"
      },
      {
        title: "220 - 230",
        condition: "elevation >= 220 AND elevation <= 230"
      },
      {
        title: "230 - 240",
        condition: "elevation >= 230 AND elevation <= 240"
      }
    ]
  });

  var stats = addStats();
  loadStats(stats, widgets);

  widgets.each(function(widget) {
    widget.bind('change:activeFilter', function() {

      var sql = generateSQL(originalSQL, widgets);
      var cartoCSS = generateCartoCSS(originalCartoCSS, widgets);

      sublayer.set({
        sql: sql,
        cartocss: cartoCSS
      });

      loadStats(stats, widgets);
    });
  });

  renderStats(stats);
  renderWidgets(widgets);
};

var loadStats = function(stats, widgets) {
  var statsQuery = "SELECT COUNT(ndvi) AS count, AVG(ndvi) AS avg, MAX(ndvi) AS max, MIN(ndvi) AS min FROM cornell_grape_data_sample";

  var filterConditions = widgets.getActiveFilterConditions();
  if (filterConditions.length) {
    statsQuery += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("Stats query: ", statsQuery);

  cartodb.SQL({ user: 'orbitist'}).execute(statsQuery, function(data) {
    var row = data.rows[0];
    stats.set({
      count: row.count,
      min: row.min,
      max: row.max,
      avg: row.avg
    });
  });
};

var generateSQL = function(originalSQL, widgets) {
  var sql = originalSQL;
  var filterConditions = widgets.getActiveFilterConditions();

  if (filterConditions.length) {
    sql += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("SQL: ", sql);

  return sql;
};

var generateCartoCSS = function(originalCartoCSS, widgets) {
  var cartoCSS = originalCartoCSS;
  var filterConditions = widgets.getActiveFilterConditions();

  console.log("CartoCSS: ", cartoCSS);

  return cartoCSS;
};

window.onload = main;
