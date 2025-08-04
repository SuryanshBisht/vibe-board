import React from 'react';

// Simple Unicode/emoji icons for demonstration
const shapes = [
  { name: 'Rectangle', icon: '▭' },
  { name: 'Line', icon: '➖' },
  { name: 'Arrow', icon: '➡️' },
  { name: 'Ellipse', icon: '⚪' }
];

const ShapeMenu = ({ selectedShape, onSelectShape }) => (
  <div style={{
    display: 'flex',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    {shapes.map(shape => (
      <button
        key={shape.name}
        onClick={() => onSelectShape(shape.name)}
        style={{
          width: 40,
          height: 40,
          fontSize: 22,
          border: selectedShape === shape.name ? '3px solid #333' : '1px solid #ccc',
          borderRadius: '8px',
          background: '#f9f9f9',
          cursor: 'pointer'
        }}
        aria-label={`Select ${shape.name}`}
        title={shape.name}
      >
        {shape.icon}
      </button>
    ))}
  </div>
);

export default ShapeMenu;