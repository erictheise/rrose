## Rrose: A Leaflet Plugin for Edge Cases

### What it does

Rrose is a plugin for the Leaflet JavaScript Mapping Library. It's useful when you want popups to respond to the mouseover and mousemove events, but the behavior associated with autoPan is getting in your way.  The [GitHub page](http://erictheise.github.com/rrose/) shows two types of problems and how Rrose remedies them.

### How to use it

In your project, drop `leaflet.rrose-src.js` alongside `leaflet-src.js`, `leaflet.rrose.css` alongside `leaflet.css`. You can also install Rrose via [bower](http://bower.io/). Then, instead of instantiating a new `L.Popup` object, instantiate a new `L.Rrose` object:


```javascript
...

onEachFeature: function(feature,layer){
  layer.on('mouseover mousemove', function(e){
    var hover_bubble = new L.Rrose({ offset: new L.Point(0,0), autoPan: false, closeButton: true, height: tooltip_height, width: 303})
			      .setContent(getOverlayTooltipHtml(layer.feature))
			      .setLatLng(e.latlng)
			      .openOn(map);
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
  | e                     w |
  |                         |
  |                         |
  | ne         n         nw |
   -------------------------
```

 Two new directions are added in which the tip moves along side based on the point of selection in the map. The tooltip is fixed starting from the top of the view port while the tip moves.The tooltip is opened in east or west based on space available.
 
 The default behavior where orientation switching occurs when the point is closer than 80 pixels to the borders of your map, is changed now and the user can send the width and height of the tooltip in options.  
