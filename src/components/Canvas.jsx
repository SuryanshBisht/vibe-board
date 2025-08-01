import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ColorMenu from './ColorMenu';
import BrushMenu from './BrushMenu';
import draw from '../utilities/draw_function';

const Canvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  
  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    contextRef.current = context;
    // draw(context);
  });

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const ctx = contextRef.current;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleMouseOut = () => {
    isDrawingRef.current = false;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        style={{ border: '1px solid #000', background: '#fff' }}
      ></canvas>
      <ColorMenu canvasRef={canvasRef} />
      <BrushMenu canvasRef={canvasRef} />
    </>
  );
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default Canvas;