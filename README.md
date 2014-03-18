## Rrose: A Leaflet Plugin for Edge Cases

### What it does

Rrose is a plugin for the Leaflet JavaScript Mapping Library. It's useful when you want popups to respond to the mouseover and mousemove events, but the behavior associated with autoPan is getting in your way.  The [GitHub page](http://erictheise.github.com/rrose/) shows two types of problems and how Rrose remedies them.

### How to use it

In your project, drop `rrose-src.js` alongside `leaflet-src.js`, `leaflet.rrose.css` alongside `leaflet.css`. Then, instead of instantiating a new `L.Popup` object, instantiate a new `L.Rrose` object:


```javascript
...

onEachFeature: function(feature,layer){
  layer.on('mouseover mousemove', function(e){
    var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
      .setContent(feature.properties.name)
      .setLatLng(e.latlng)
      .openOn(rrose_map);
  });
  layer.on('mouseout', function(e){ rrose_map.closePopup() });
}

...
```

### About positions

`this.options.position` is used throughout Rrose to refer to the direction in which the popup opens relative to the point. The ASCII diagram below shows that the possible values are opposite what you'd find on a compass rose.

```
   -------------------------
  | se         s         sw |
  |                         |
  |                         |
  |                         |
  |                         |
  |                         |
  | ne         n         nw |
   -------------------------
```

 At one point, I had the notion that the tip should be placed alongside the popup when the point was closer to the left or right edge of the map than to the top or bottom. I may revisit this idea in a future version, but in the current version, the tip always appears above or below the popup. In release 0.1.0, corners were subdivided based on which direction predominated, so that values such as 'ese' and 'sse' were calculated and addressed in css, although there was no difference visible between them; this behavior has been removed as unnecessary.
 
 By default, orientation switching occurs when the point is closer than 80 pixels to the borders of your map.  Changing the values of ```x_bound``` & ```y_bound``` will alter this behavior.
