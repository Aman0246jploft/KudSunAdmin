import React, { useState, useEffect } from "react";
import classNames from "classnames";

const Image = ({
  src,
  alt = "Image",
  width,
  height,
  className = "",
  fallback = '/Profileimage.png',
  rounded = false,
  shadow = false,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    // Update the image source if the passed src changes
    if (src) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(fallback);
    }
  }, [src, fallback]);

  const handleError = () => {
    setCurrentSrc(fallback);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={handleError}
      className={classNames(className, {
        "rounded-xl": rounded,
        "shadow-md": shadow,
      })}
      {...props}
    />
  );
};

export default Image;
