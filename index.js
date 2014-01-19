window.DistanceOverlay = (function(){

    function DistanceOverlay(options) {
        this.options = options;
        this.target = options.position;
        this.div = document.createElement('div');
        this.div.className = 'distance-helper';
        return this;
    }

    DistanceOverlay.prototype = new google.maps.OverlayView();

    DistanceOverlay.prototype.onAdd = function(){
        this.getMap().getDiv().appendChild(this.div);
        google.maps.event.addListener(this.getMap(), 'center_changed', bind(this.moveOverlay, this));
    };

    DistanceOverlay.prototype.getDiv = function(){
        return this.div;
    };

    DistanceOverlay.prototype.moveOverlay = function(){
        if(!this.getMap()) return;

        if(this.getMap().getBounds().contains(this.target)){
            hideDiv(this.div);
            return;
        }

        showDiv(this.div);

        var headingToTarget = google.maps.geometry.spherical.computeHeading(this.getMap().getCenter(), this.target),
        css = {},
        mapWidth = this.getMap().getDiv().offsetWidth,
        mapHeight = this.getMap().getDiv().offsetHeight,
        edgeAngle = this.edgeAngle(this.target),
        edge = edgeAngle[0],
        angle = edgeAngle[1];

        switch(edge){
        case 'top':
            css.top = '0px';
            css.left = (mapWidth / 2 + Math.tan(angle * Math.PI / 180) * (mapHeight / 2)) + 'px';
            css.bottom = css.right = 'auto';
            break;
        case 'bottom':
            css.bottom = '0px';
            css.left = (mapWidth / 2 + Math.tan(angle * Math.PI / 180) * (mapHeight / 2)) + 'px';
            css.top = css.right = 'auto';
            break;
        case 'left':
            css.left = '0px';
            css.top = (mapHeight / 2 + Math.tan(angle * Math.PI / 180) * (mapWidth / 2)) + 'px';
            css.bottom = css.right = 'auto';
            break;
        case 'right':
            css.right = '0px';
            css.top = (mapHeight / 2 + Math.tan(angle * Math.PI / 180) * (mapWidth / 2)) + 'px';
            css.left = css.bottom = 'auto';
            break;
        }

        this.div.setAttribute('data-heading', edge);
        for(field in css){
            this.div.style[field] = css[field];
        }

        var projection = this.getProjection(),
        position = this.div.getBoundingClientRect();

        var divCoord = projection.fromContainerPixelToLatLng(new google.maps.Point(position.left, position.top));
        var distance = google.maps.geometry.spherical.computeDistanceBetween(divCoord, this.target);
        this.div.innerText = this.formatDistance(distance);
    };

    DistanceOverlay.prototype.formatDistance = function(distance){
        if(distance < 500){
            return Math.round(distance) + ' m';
        } else {
            return Math.round(distance / 100) / 10 + ' km';
        }
    };

    DistanceOverlay.prototype.edgeAngle = function(target){
        var headingToTarget = google.maps.geometry.spherical.computeHeading(this.getMap().getCenter(), target);
        var cornerAngle1 = google.maps.geometry.spherical.computeHeading(this.getMap().getCenter(), this.getMap().getBounds().getNorthEast());
        var cornerAngle2 = 180 - cornerAngle1;
        if(headingToTarget > -cornerAngle1 && headingToTarget < cornerAngle1){
            return ['top', headingToTarget];
        } else if (headingToTarget > cornerAngle1 && headingToTarget < cornerAngle2){
            return ['right', headingToTarget - 90];
        } else if (headingToTarget < -cornerAngle1 && headingToTarget > -cornerAngle2){
            return ['left', 90 - headingToTarget];
        } else {
            return ['bottom', headingToTarget > 0 ? 180 - headingToTarget : - 180 -  headingToTarget];
        }
    };

    DistanceOverlay.prototype.draw = function(){
        this.moveOverlay();
    };

    DistanceOverlay.prototype.onRemove = function(){
        this.div.remove();
    };

    function bind(){
        var arr = toArr(arguments),
        func = arr.shift(),
        self = arr.shift();
        return function(){
            return func.apply(self, arr.concat(toArr(arguments)));
        };
    };

    function toArr(o){ return Array.prototype.slice.apply(o); };

    function hideDiv(div){
        div.style.display = 'none';
    }

    function showDiv(div){
        div.style.display = 'block';
    }

    return DistanceOverlay;

})();
