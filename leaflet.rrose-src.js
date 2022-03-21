/*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
    
L.Rrose = L.Popup.extend({

  _initLayout:function () {
    var prefix = 'leaflet-rrose',
      container = this._container = L.DomUtil.create('div', prefix + ' ' + this.options.className + ' leaflet-zoom-animated'),
      wrapper;
    // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
    var x_bound = this.options.width, y_bound = this.options.height;
    // tip of the tooltip has side = 15px
    // therefore tip_base = 15*sqrt(2)/2 , tip_altitude = sqrt(15^2-(base/2)^2), tip_padding = 20 - tip_altitude
    // these are needed for positioning the tooltip properly
    
    let tip_side = 15;
    this.tip_base = tip_side * Math.sqrt(2); 
    this.tip_altitude = Math.sqrt(Math.pow(tip_side,2)-Math.pow(this.tip_base/2,2));
    this.tip_padding = 20 - this.tip_altitude;// tip container width = 20px
    y_bound -= this.tip_padding;
    this.options.position = '';
    // Then see if the point is too far north...
    let n_diff = this._map.latLngToContainerPoint(this._latlng).y - y_bound;
    let s_diff = (this._map.getSize().y - this._map.latLngToContainerPoint(this._latlng).y)-y_bound;
    if (n_diff > 0) {
      this.options.position = 'n';
    } else if(s_diff > 0){
		this.options.position = 's';
	} 
    // or too far east...
    var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
    if (x_diff > 0) {
      this.options.position += 'w';
    } else {
    // or too far west.
      x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
      if (x_diff > 0) {
        this.options.position += 'e';
      }
    }
    // if the tooltip fits neither north nor south, we can move the tip pointer along the y axis and fix the tooltip instead 
    // this is possible considering the height and width of the tooltip is always less than the height and width of the map respectively

    if(this.options.position == ''){
		//tooltip fits neither north nor south and it is ok to open it both east and west, we set our default to east	
		this.options.position = 'e';
	}

    // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
    if (/s/.test(this.options.position)) {
      if (this.options.position === 's') {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      } 
      else {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      }
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
    } 
    else if (/n/.test(this.options.position)){
      if (this.options.position === 'n') {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      } 
      else {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
      }
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
    } else {
		if (this.options.position === 'e') {
	        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
	        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
        } else if(this.options.position === 'w'){
			wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
	        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
	   }
	   this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
       L.DomEvent.disableClickPropagation(wrapper);
       this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
       L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
	}
	if (this.options.closeButton) {
      closeButton = this._closeButton = L.DomUtil.create('a', 'leaflet-popup-close-button', container);
      closeButton.innerHTML = '&#215;';

      L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
    }
  },

  _updatePosition:function () {
    var pos = this._map.latLngToLayerPoint(this._latlng),
      is3d = L.Browser.any3d,
      offset = this.options.offset;

    if (is3d) {
      L.DomUtil.setPosition(this._container, pos);
    }

    if (/s/.test(this.options.position)) {
      this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y) + this.tip_padding;
      this._closeButton.style.top = "20px";
    } else {
      this._containerBottom = -offset.y - (is3d ? 0 : pos.y) - this.tip_padding;
    }

    if (/e/.test(this.options.position)) {
      this._containerLeft = offset.x + (is3d ? 0 : pos.x);
    } 
    else if (/w/.test(this.options.position)) {
      this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x);
    } 
    else {
      this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x);
    }
	if(this.options.position == 'e' || this.options.position == 'w'){
		//this._containerBottom = -(this._container.offsetHeight/2) + offset.y;
		this.tip_base = this.options.position == 'e' ? this.tip_base / 2 * -1 : this.tip_base / 2; 
		this._containerBottom = -(this._container.offsetHeight-this._map.latLngToContainerPoint(this._latlng).y) + offset.y;
		this._containerLeft = this._containerLeft + offset.x - this.tip_base;
		this._tipContainer.style.top = this._map.latLngToContainerPoint(this._latlng).y - this.tip_altitude+"px";
	} 
    this._container.style.bottom = this._containerBottom + 'px';
    this._container.style.left = this._containerLeft + 'px';
  }

});
