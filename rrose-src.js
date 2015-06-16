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
      closeButton;

    if (this.options.closeButton) {
      closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
      closeButton.href = '#close';
      closeButton.innerHTML = '&#215;';

      L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
    }

    this.options.rrose = {
      prefix: prefix,
      x_bound: this.options.x_bound || 80,
      y_bound: this.options.y_bound || 80
    };

    // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
    this.updateDirection();
  },

  updateDirection: function() {
    var prefix = this.options.rrose.prefix,
      container = this._container,
      closeButton = this._closeButton,
      wrapper = this._wrapper,
      x_bound = this.options.rrose.x_bound,
      y_bound = this.options.rrose.y_bound,
      currentPosition = this.options.position;

    // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
    var newPosition = 'n';
    // Then see if the point is too far north...
    var y_diff = y_bound - this._map.latLngToContainerPoint(this._latlng).y;
    if (y_diff > 0) {
      newPosition = 's'
    }
    // or too far east...
    var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
    if (x_diff > 0) {
      newPosition += 'w'
    } else {
    // or too far west.
      x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
      if (x_diff > 0) {
        newPosition += 'e'
      }
    }

    if (!currentPosition) {
      // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
      if (/s/.test(newPosition)) {
        if (newPosition === 's') {
          this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
          wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        } 
        else {
          this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + newPosition, container);
          wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + newPosition, container);
        }
        this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + newPosition, this._tipContainer);
        L.DomEvent.disableClickPropagation(wrapper);
        this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
        L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
      } 
      else {
        if (newPosition === 'n') {
          wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
          this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
        } 
        else {
          wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + newPosition, container);
          this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + newPosition, container);
        }
        L.DomEvent.disableClickPropagation(wrapper);
        this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
        L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
        this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + newPosition, this._tipContainer);
      }
      this.options.position = newPosition;
    }
    else if (currentPosition != newPosition) {
      // Update classes
      L.DomUtil.removeClass(this._wrapper, prefix + '-content-wrapper-' + currentPosition);
      L.DomUtil.addClass(this._wrapper, prefix + '-content-wrapper-' + newPosition);
      L.DomUtil.removeClass(this._tipContainer, prefix + '-tip-container-' + currentPosition);
      L.DomUtil.addClass(this._tipContainer, prefix + '-tip-container-' + newPosition);
      L.DomUtil.removeClass(this._tip, prefix + '-tip-' + currentPosition);
      L.DomUtil.addClass(this._tip, prefix + '-tip-' + newPosition);
      // Swap DOM elements to keep correct order
      if (/n/.test(currentPosition) && /s/.test(newPosition)) {
        this._wrapper.parentNode.insertBefore(this._tipContainer, this._wrapper);
      }
      else if (/s/.test(currentPosition) && /n/.test(newPosition)) {
        this._tipContainer.parentNode.insertBefore(this._wrapper, this._tipContainer);
      }
      // Finally update elements position
      this.options.position = newPosition;
      this._updatePosition();
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
      this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y);
    } else {
      this._containerBottom = -offset.y - (is3d ? 0 : pos.y);
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

    this._container.style.bottom = this._containerBottom + 'px';
    this._container.style.left = this._containerLeft + 'px';
  }

});
