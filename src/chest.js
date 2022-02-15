import { useState, useRef, useEffect } from 'react';
import { vec3, quat, mat4 } from 'gl-matrix';
import '@kitware/vtk.js/favicon';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkImageCroppingWidget from '@kitware/vtk.js/Widgets/Widgets3D/ImageCroppingWidget';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import swap from './index';
const home = `
<table>
  <tr>
    <td>pickable</td>
    <td>
      <input class='flag' data-name="pickable" type="checkbox" checked change = "handleChange()"/>
    </td>
  </tr>
  <tr>
    <td>visibility</td>
    <td>
      <input class='flag' data-name="visibility" type="checkbox" checked  change = {handleChange()} />
    </td>
  </tr>
  <tr>
    <td>contextVisibility</td>
    <td>
      <input class='flag' data-name="contextVisibility" type="checkbox" checked change = {handleChange()} />
    </td>
  </tr>
  <tr>
    <td>handleVisibility</td>
    <td>
      <input class='flag' data-name="handleVisibility" type="checkbox" checked  change = {handleChange()} />
    </td>
  </tr>
  <tr>
    <td>faceHandlesEnabled</td>
    <td>
      <input class='flag' data-name="faceHandlesEnabled" type="checkbox" checked   change = {handleChange()} />
    </td>
  </tr>
  <tr>
    <td>edgeHandlesEnabled</td>
    <td>
      <input class='flag' data-name="edgeHandlesEnabled" type="checkbox" checked change = {handleChange()}  />
    </td>
  </tr>
  <tr>
    <td>cornerHandlesEnabled</td>
    <td>
      <input class='flag' data-name="cornerHandlesEnabled" type="checkbox" checked  change = {handleChange()} />
    </td>
  </tr>
</table>
`;
function Chest() {
  const vtkContainerRef = useRef(null);//using the <div> in the return statament as the ref when starting rendering 
  const context = useRef(null);     
   const [flag, setflag] = useState(0);
  useEffect(() => {
    if (!context.current) {
      const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        rootContainer: vtkContainerRef.current,//the <div> element for rendering
      });
  const overlaySize = 15;
  const overlayBorder = 2;
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.width = `${overlaySize}px`;
  overlay.style.height = `${overlaySize}px`;
  overlay.style.border = `solid ${overlayBorder}px red`;
  overlay.style.borderRadius = '50%';
  overlay.style.left = '-100px';
  overlay.style.pointerEvents = 'none';
  document.querySelector('body').appendChild(overlay);
  const rootContainer = vtkContainerRef.current;
  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  const apiRenderWindow = fullScreenRenderer.getApiSpecificRenderWindow();
  const widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(renderer);
  const widgetCrop = vtkImageCroppingWidget.newInstance();
  function widgetRegistration(e) {
    const action = e ? e.currentTarget.dataset.action : 'addWidget';
    const viewWidget = widgetManager[action](widgetCrop);
    if (viewWidget) {
      viewWidget.setDisplayCallback((coords) => {
        overlay.style.left = '-100px';
        if (coords) {
          const [w, h] = apiRenderWindow.getSize();
          overlay.style.left = `${Math.round(
            (coords[0][0] / w) * window.innerWidth -
              overlaySize * 0.5 -
              overlayBorder
          )}px`;
          overlay.style.top = `${Math.round(
            ((h - coords[0][1]) / h) * window.innerHeight -
              overlaySize * 0.5 -
              overlayBorder
          )}px`;
        }
      });
      renderer.resetCamera();
      renderer.resetCameraClippingRange();
    }
    widgetManager.enablePicking();
    renderWindow.render();
  }
  widgetRegistration();
  fullScreenRenderer.addController(home);
  const urlToLoad = rootContainer
  ? rootContainer.dataset.url ||
  'https://kitware.github.io/vtk-js/data/volume/LIDC2.vti'
  : `https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`;



renderWindow.getInteractor().setDesiredUpdateRate(15.0);

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const body = rootContainer || document.querySelector('body');

// Create Widget container
const widgetContainer = document.createElement('div');
widgetContainer.style.position = 'absolute';
widgetContainer.style.bottom = 'calc(10px + 1em)';
widgetContainer.style.right = '5px';
widgetContainer.style.background = 'rgba(255, 255, 255, 0.3)';
body.appendChild(widgetContainer);

// Create Label for preset
const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '5px';
labelContainer.style.left = '5px';
labelContainer.style.width = '100%';
labelContainer.style.color = 'white';
labelContainer.style.textAlign = 'center';
labelContainer.style.userSelect = 'none';
labelContainer.style.cursor = 'pointer';
body.appendChild(labelContainer);

let presetIndex = 1;
const globalDataRange = [0, 255];
const lookupTable = vtkColorTransferFunction.newInstance();

function changePreset(delta = 1) {
  presetIndex =
    (presetIndex + delta + vtkColorMaps.rgbPresetNames.length) %
    vtkColorMaps.rgbPresetNames.length;
  lookupTable.applyColorMap(
    vtkColorMaps.getPresetByName(vtkColorMaps.rgbPresetNames[presetIndex])
  );
  lookupTable.setMappingRange(...globalDataRange);
  lookupTable.updateRange();
  labelContainer.innerHTML = vtkColorMaps.rgbPresetNames[presetIndex];
}

let intervalID = null;
function stopInterval() {
  if (intervalID !== null) {
    clearInterval(intervalID);
    intervalID = null;
  }
}

labelContainer.addEventListener('click', event => {
  if (event.pageX < 200) {
    stopInterval();
    changePreset(-1);
  } else {
    stopInterval();
    changePreset(1);
  }
});

const widget = vtkPiecewiseGaussianWidget.newInstance({
  numberOfBins: 256,
  size: [400, 150],
});
widget.updateStyle({
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  histogramColor: 'rgba(100, 100, 100, 0.5)',
  strokeColor: 'rgb(0, 0, 0)',
  activeColor: 'rgb(255, 255, 255)',
  handleColor: 'rgb(50, 150, 50)',
  buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
  buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
  buttonStrokeColor: 'rgba(0, 0, 0, 1)',
  buttonFillColor: 'rgba(255, 255, 255, 1)',
  strokeWidth: 2,
  activeStrokeWidth: 3,
  buttonStrokeWidth: 1.5,
  handleWidth: 3,
  iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
  padding: 10,
});

fullScreenRenderer.setResizeCallback(({ width, height }) => {
  widget.setSize(Math.min(450, width - 10), 150);
});

const piecewiseFunction = vtkPiecewiseFunction.newInstance();
const actor = vtkVolume.newInstance();
const mapper = vtkVolumeMapper.newInstance({ sampleDistance: 1.1 });
const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

function getCroppingPlanes(imageData, ijkPlanes) {
  const rotation = quat.create();
  mat4.getRotation(rotation, imageData.getIndexToWorld());

  const rotateVec = (vec) => {
    const out = [0, 0, 0];
    vec3.transformQuat(out, vec, rotation);
    return out;
  };

  const [iMin, iMax, jMin, jMax, kMin, kMax] = ijkPlanes;
  const origin = imageData.indexToWorld([iMin, jMin, kMin]);
  // opposite corner from origin
  const corner = imageData.indexToWorld([iMax, jMax, kMax]);
  return [
    // X min/max
    vtkPlane.newInstance({ normal: rotateVec([1, 0, 0]), origin }),
    vtkPlane.newInstance({ normal: rotateVec([-1, 0, 0]), origin: corner }),
    // Y min/max
    vtkPlane.newInstance({ normal: rotateVec([0, 1, 0]), origin }),
    vtkPlane.newInstance({ normal: rotateVec([0, -1, 0]), origin: corner }),
    // z min/max
    vtkPlane.newInstance({ normal: rotateVec([0, 0, 1]), origin }),
    vtkPlane.newInstance({ normal: rotateVec([0, 0, -1]), origin: corner }),
  ];
}
//reading data
reader.setUrl(urlToLoad).then(() => {
  reader.loadData().then(() => {
     const imageData = reader.getOutputData();
    const dataArray = imageData.getPointData().getScalars();
    const dataRange = dataArray.getRange();
    globalDataRange[0] = dataRange[0];
    globalDataRange[1] = dataRange[1];
    
    // Update Lookup table
    changePreset();

    //................. Automatic switch to next preset every 5s...............
    // if (!rootContainer) {
    //   intervalID = setInterval(changePreset, 5000);
    // }

    widget.setDataArray(dataArray.getData());
    widget.applyOpacity(piecewiseFunction);

    widget.setColorTransferFunction(lookupTable);
    lookupTable.onModified(() => {
      widgetCrop.render();
      renderWindow.render();
    });

    // update crop widget
    widgetCrop.copyImageDataDescription(imageData);
    const cropState = widgetCrop.getWidgetState().getCroppingPlanes();
    cropState.onModified(() => {
      const planes = getCroppingPlanes(imageData, cropState.getPlanes());
      mapper.removeAllClippingPlanes();
      planes.forEach((plane) => {
        mapper.addClippingPlane(plane);
      });
      mapper.modified();
    });

    renderer.addVolume(actor);
    renderer.resetCamera();
    renderer.resetCameraClippingRange();
    renderWindow.render();
  });
});

actor.setMapper(mapper);

const ctfun = vtkColorTransferFunction.newInstance();
ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
const ofun = vtkPiecewiseFunction.newInstance();
ofun.addPoint(0.0, 0.0);
ofun.addPoint(255.0, 1.0);
actor.getProperty().setRGBTransferFunction(0, lookupTable);
actor.getProperty().setScalarOpacity(0, piecewiseFunction);
actor.getProperty().setInterpolationTypeToFastLinear();
mapper.setInputConnection(reader.getOutputPort());
// try to use constant function not over load (function expression)
function updateFlag(e) {
  const value = !!e.target.checked;
  const name = e.currentTarget.dataset.name;
  widgetCrop.set({ [name]: value }); // can be called on either viewWidget or parentWidget

  widgetManager.enablePicking();
  renderWindow.render();
}

// ----------------------------------------------------------------------------
// Default setting Piecewise function widget
// ----------------------------------------------------------------------------

widget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
widget.addGaussian(0.75, 1, 0.3, 0, 0);

widget.setContainer(widgetContainer);
widget.bindMouseListeners();

widget.onAnimation((start) => {
  if (start) {
    renderWindow.getInteractor().requestAnimation(widget);
  } else {
    renderWindow.getInteractor().cancelAnimation(widget);
  }
});

widget.onOpacityChange(() => {
  widget.applyOpacity(piecewiseFunction);
  if (!renderWindow.getInteractor().isAnimating()) {
    renderWindow.render();
  }
});
const elems = document.querySelectorAll('.flag');
for (let i = 0; i < elems.length; i++) {
  elems[i].addEventListener('change', updateFlag);
}

global.widget = widget;
      context.current = {
        fullScreenRenderer,
        renderWindow,
        renderer,
        actor,
      };
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, actor } = context.current;
        actor.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  useEffect(() => {
    if (context.current) {
      const{renderWindow}=context.current;
      swap(flag);
      renderWindow.render();
    }
  }, [flag]);

  return (
    <div>
      <div ref={vtkContainerRef} />
      <table
        style={{
          position: 'absolute',
          top: '25px',
          right: '25px',
          background: 'white',
          padding: '12px',
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={flag}
                style={{ width: '100%' }}
                onInput={(ev) => setflag(Number(ev.target.value))}
              >
                <option value="0">chest</option>
                <option value="1">skull</option>
                <option value="2">Home page</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}




export default Chest;
