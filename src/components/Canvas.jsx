import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ColorMenu from './ColorMenu';
import BrushMenu from './BrushMenu';
import ShapeMenu from './ShapeMenu';
import {draw_shape} from '../utilities/draw_function';
import {brushes} from '../data/data';

const MAX_HISTORY = 10;

const Canvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);
  const [selectedShape, setSelectedShape] = useState(null);
  const startSelect = useRef(null);
  const endSelect = useRef(null);
  const [dashOffset, setDashOffset] = useState(0);
  const [selectMode, setSelectMode] = useState(true);
  const copyRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;
    saveHistory(); // Save initial state

    // Keyboard event for Ctrl+Z (Undo) and Ctrl+Y (Redo)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        redo();
      }
      if(e.key=== 'Escape') {
        e.preventDefault();
        restoreLastState();
        setSelectMode(false);
        setSelectedShape(null);
        copyRef.current = null;
        print('Selection cleared');
        print(selectMode);
        print(selectedShape)
      }
      if(selectMode && ((e.ctrlKey || e.metaKey) && e.key === 'c')) {
        // copy selected area
        e.preventDefault();
        restoreLastState();
        copyRef.current = contextRef.current.getImageData(startSelect.current[0], startSelect.current[1],
        endSelect.current[0] - startSelect.current[0], endSelect.current[1] - startSelect.current[1]);
        console.log('Copied area:', copyRef.current);
        setSelectMode(false);
      }
      if((e.ctrlkey || e.metaKey) && e.key === 'v') {
        // paste copied area
        e.preventDefault();
        console.log('Copy reference:', copyRef.current);
        // console.log('Pasting copied area at:', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        
        if(copyRef.current) {
          // contextRef.current.putImageData(copyRef.current, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          saveHistory();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save current canvas state to history
  const saveHistory = () => {
    console.log('Saving history');
    const ctx = contextRef.current;
    const imageData = ctx.getImageData(0, 0, width, height);
    if(historyRef.current.length > 0) {
      const lastState = historyRef.current[historyRef.current.length - 1];
      // If the last state is the same as the current, do not save it again
      if(lastState && lastState.data.toString() === imageData.data.toString()) {
        console.log('Current state is the same as last saved state, not saving again.');
        return;
      }
    }
    // If not at the end, remove redo states
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    }
    // Add new state
    historyRef.current.push(imageData);
    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyStepRef.current = historyRef.current.length - 1;
    console.log(`History saved. Current step: ${historyStepRef.current}, Total history: ${historyRef.current.length}`);
  };

  // restore last state
  const restoreLastState = () => {
    if (historyRef.current.length > 0) {  
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  // Undo function
  const undo = () => {
    if (historyStepRef.current > 0) {
      historyStepRef.current -= 1;
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  // Redo function
  const redo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyStepRef.current += 1;
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  const handleMouseDown = (e) => {
    if(selectMode) {
      setSelectMode(false);
      restoreLastState();
    }
    isDrawingRef.current = true;
    if(selectedShape){
      startSelect.current=[e.nativeEvent.offsetX, e.nativeEvent.offsetY];
      return;
    }
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    if(selectedShape){
      endSelect.current=[e.nativeEvent.offsetX, e.nativeEvent.offsetY];
      // Restore the canvas to the last saved state before drawing the shape
      const ctx = contextRef.current;
      if (historyRef.current.length > 0) {
        ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
      }
      
      if(selectedShape === 'Select') {
        draw_shape(ctx,'Select',startSelect.current,endSelect.current,
          dashOffset, // you should animate this with requestAnimationFrame for animation
          true
        );
      }else{
        draw_shape(ctx, selectedShape, startSelect.current, endSelect.current);
      }
      return;
    }
    const ctx = contextRef.current;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = (e) => {
    endSelect.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
    isDrawingRef.current = false;

    if (selectedShape === 'Select') {
      const ctx = contextRef.current;
      draw_shape(ctx, 'Select', startSelect.current, endSelect.current, dashOffset, false);
      setSelectedShape(null);
      setSelectMode(true);
      console.log('Selection made:', startSelect.current, endSelect.current);
      return;
    }

    setSelectedShape(null);
    saveHistory();
  };

  const handleMouseOut = () => {
    // if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if(!selectMode){
      saveHistory();
    }
  };

  useEffect(() => {
    let frame;
    if (selectedShape === 'Select') {
      // Draw blur overlay and animated rectangle
      const ctx = contextRef.current;
      // this line only makes a blur effect
      draw_shape(ctx,'Select',[0,0],[0,0],
        dashOffset, // you should animate this with requestAnimationFrame for animation
        true
      );
    
      const animate = () => {
        setDashOffset((prev) => (prev + 2) % 100);
        frame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(frame);
    }
  }, [selectedShape]);

  return (
    <>
      <ShapeMenu selectedShape={selectedShape} onSelectShape={setSelectedShape} />
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        style={{ border: '1px solid #000', background: '#fff' , cursor: selectedShape ? 'crosshair' : 'default'}}
      ></canvas>
      
      <ColorMenu canvasRef={canvasRef}/>
      <BrushMenu canvasRef={canvasRef}/>
    </>
  );
};

Canvas.propTypes = { 
  draw: PropTypes.func,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};


export default Canvas;