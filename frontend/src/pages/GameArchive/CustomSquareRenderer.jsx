import React, { forwardRef } from 'react';

const CustomSquareRenderer = forwardRef((props, ref) => {
  const { children, square, squareColor, style } = props;

  // Örneğin, resim URL'sini buradan geçebilirsiniz.
  const imageURL = '../../components/assets/img/blitz.png';

  return (
    <div
      ref={ref}
      style={{
        ...style,
        position: 'relative',
        backgroundColor: squareColor,
      }}
    >
      {children}
      {/* Sağ üst köşeye resim eklemek için */}
      <img
        src={imageURL}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 16, // Resmin boyutunu ayarlayın
          height: 16,
          borderTopLeftRadius: 4,
          // Diğer stil ayarlarını yapabilirsiniz
        }}
      />
    </div>
  );
});

export default CustomSquareRenderer;