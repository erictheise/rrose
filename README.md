## Rrose: A Leaflet Plugin for Edge Cases

### What it does

Rrose is a plugin for the Leaflet JavaScript Mapping Library. It's useful when you want popups to respond to the mouseover event, but the behavior associated with autoPan is getting in your way.  The [GitHub page](http://erictheise.github.com/rrose/) shows two types of problems and how RRose remedies them.

### How to use it

In your project, drop `rrose-src.js` alongside `leaflet-src.js`, `leaflet.rrose.css` and `leaflet.rrose.ie.css` alongside `leaflet.css`. Include `leaflet.rrose.ie.css` conditionally, as you are already doing with `leaflet.ie.css`. Then, instead of instantiating a new `L.Popup` object, instantiate a new `L.Rrose` object, e.g.


```javascript
...

onEachFeature: function(feature,layer){
  layer.on('mouseover', function(e){
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

The "positions" used in Rrose refer to the relative direction in which the popup opens, so they may at first
seem to be the opposite of what you'd expect.

```
   -------------------------
  |  sse       s       ssw  |
  |ese                   wsw|
  |                         |
  |e                       w|
  |                         |
  |nne                   nnw|
  |  ene       n       wnw  |
   -------------------------
```
