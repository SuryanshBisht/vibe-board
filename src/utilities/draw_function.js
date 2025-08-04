export function draw_shape(ctx, shape, start, end) {
  const x1 = start[0], y1 = start[1];
  const x2 = end[0], y2 = end[1];

  switch (shape) {
    case 'Rectangle':
      ctx.beginPath();
      ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      ctx.stroke();
      break;
    case 'Line':
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
    case 'Arrow':
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headlen = 10;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      break;
    case 'Ellipse':
      ctx.beginPath();
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const rectWidth = Math.abs(x2 - x1);
      const rectHeight = Math.abs(y2 - y1);
      const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      ctx.ellipse(
        left + rectWidth / 2,
        top + rectHeight / 2,
        rectWidth / 2,
        rectHeight / 2,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      break;
    default:
      break;
  }
}