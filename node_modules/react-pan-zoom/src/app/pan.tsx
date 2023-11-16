import * as React from 'react';
const objectAssign = require('object-assign');
const jquery       = require('jquery');

interface PanState {
  x?: number;
  y?: number;
  mouseDown?: boolean;
}

export default class Pan extends React.Component<{}, PanState> {

  private pIndicatorElm: any;
  private panInterval: number;
  private pannerElm: any;
  private options = {
    fitPadding: 50,
    maxZoom: 10,
    minZoom: 0.1,
    panDistance: 10,
    panDragAreaSize: 75,
    panInactiveArea: 8,
    panIndicatorMinOpacity: 0.5,
    panMinPercentSpeed: 0.25,
    panSpeed: 10,
    resetIcon: "fa fa-expand",
    sliderHandleIcon: "fa fa-minus",
    zoomDelay: 45,
    zoomFactor: 0.05,
    zoomInIcon: "fa fa-plus",
    zoomOnly: false,
    zoomOutIcon: "fa fa-minus"
  };

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.setState({
      x: 1,
      y: 1,
      mouseDown: false
    });

    this.pannerElm     = jquery('.cy-panzoom-panner');
    this.pIndicatorElm = jquery('cy-panzoom-pan-indicator');

    document.onmouseup = e => this.handleMouseUp();
  }

  /*
   updateIndicatorPosition (e) {
   console.log('e is:', objectAssign({}, e));

   console.log(`${e.pageX}, ${e.pageY}, ${e.screenX}, ${e.screenY}`);

   this.setState({
   x: e.pageX, y: e.pageY
   });
   }*/

  handle2pan (e) {
    var v = {
      x: e.pageX - this.pannerElm.offset().left - this.pannerElm.width() / 2,
      y: e.pageY - this.pannerElm.offset().top - this.pannerElm.height() / 2
    };

    var r       = this.options.panDragAreaSize;
    var d       = Math.sqrt(v.x * v.x + v.y * v.y);
    var percent = Math.min(d / r, 1);

    if (d
      < this.options.panInactiveArea) {
      return {
        x: NaN,
        y: NaN
      };
    }

    v = {
      x: v.x / d,
      y: v.y / d
    };

    percent = Math.max(this.options.panMinPercentSpeed, percent);

    var vnorm = {
      x: -1 * v.x * (percent * this.options.panDistance),
      y: -1 * v.y * (percent * this.options.panDistance)
    };

    return vnorm;
  }

  calcIndicatorPosition (pan) {
    var v     = pan;
    var d     = Math.sqrt(v.x * v.x + v.y * v.y);
    var vnorm = {
      x: -1 * v.x / d,
      y: -1 * v.y / d
    };

    var w       = this.pannerElm.width();
    var h       = this.pannerElm.height();
    var percent = d / this.options.panDistance;
    var opacity = Math.max(this.options.panIndicatorMinOpacity, percent);
    var color   = 255 - Math.round(opacity * 255);

    this.setState({
      x: w / 2 * vnorm.x + w / 2,
      y: h / 2 * vnorm.y + h / 2
    });
    // this.pIndicatorElm.show().css({
    //   left: w / 2 * vnorm.x + w / 2,
    //   top: h / 2 * vnorm.y + h / 2,
    //   background: "rgb(" + color + ", " + color + ", " + color + ")"
    // });
  }

  handlePan (e) {
    e.stopPropagation(); // don't trigger dragging of panzoom
    e.preventDefault(); // don't cause text selection
    clearInterval(this.panInterval);

    if (!this.state.mouseDown) {
      return;
    }

    var pan = this.handle2pan(e);

    if (isNaN(pan.x) || isNaN(pan.y)) {
      this.pIndicatorElm.hide();
      return;
    }

    this.calcIndicatorPosition(pan);
    this.panInterval = setInterval(function () {
      // $container.cytoscape("get").panBy(pan);
      // console.log('calling panBy event: ', pan);
    }, this.options.panSpeed);
  }

  donePanning () {
    
    clearInterval(this.panInterval);
  }

  handleMouseDown () {
    this.setState({ mouseDown: true });
  }

  handleMouseUp () {
    console.log('mouseup');
    this.setState({ mouseDown: false });
  }

  render () {
    const styles = {
      indicator: {
        display: 'block',
        left: '28.9443px',
        top: '2.11146px',
        background: 'rgb(127, 127, 127)'
      }
    };

    const updatedStyle = {
      left: '1px',
      top: '1px',
      display: 'none'
    };

    if (this.state) {
      updatedStyle.left    = this.state.x + 'px';
      updatedStyle.top     = this.state.y + 'px';
      updatedStyle.display = this.state.mouseDown ? 'block' : 'none';
    }

    return (
      <div className="cy-panzoom-panner">

        <div className="cy-panzoom-panner-handle"
             onMouseDown={e => this.handleMouseDown()}
             onMouseMove={e => this.handlePan(e)}
             onMouseOut={e => this.donePanning()}/>

        <div className="cy-panzoom-pan-up cy-panzoom-pan-button"/>
        <div className="cy-panzoom-pan-down cy-panzoom-pan-button"/>
        <div className="cy-panzoom-pan-left cy-panzoom-pan-button"/>
        <div className="cy-panzoom-pan-right cy-panzoom-pan-button"/>

        <div className="cy-panzoom-pan-indicator"
             style={objectAssign(styles.indicator, updatedStyle)}/>
      </div>
    )
  }
}