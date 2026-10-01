import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

type ColorPickerProps = {
  id: string;
  name: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const parseHex = (color: string) => {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = Number.parseInt(hex.slice(0, 2), 16) || 0;
  const g = Number.parseInt(hex.slice(2, 4), 16) || 0;
  const b = Number.parseInt(hex.slice(4, 6), 16) || 0;
  const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;

  return [r, g, b, a];
};

const formatHex = (r: number, g: number, b: number, a: number) => {
  const alphaHex =
    a < 1
      ? Math.round(a * 255)
          .toString(16)
          .padStart(2, '0')
      : '';
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}${alphaHex}`;
};

const hsvToRgb = (h: number, s: number, v: number) => {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

  return [
    Math.round(f(5) * 255),
    Math.round(f(3) * 255),
    Math.round(f(1) * 255),
  ];
};

const rgbToHsv = (r: number, g: number, b: number) => {
  const dr = r / 255;
  const dg = g / 255;
  const db = b / 255;
  const max = Math.max(dr, dg, db);
  const min = Math.min(dr, dg, db);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case dr:
        h = (dg - db) / delta + (dg < db ? 6 : 0);
        break;
      case dg:
        h = (db - dr) / delta + 2;
        break;
      case db:
        h = (dr - dg) / delta + 4;
        break;
    }
    h *= 60;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h, s, v];
};

const getTextColor = (r: number, g: number, b: number, a: number) => {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (a < 0.5) {
    return '#000000';
  }
  return brightness < 128 ? '#ffffff' : '#000000';
};

const ColorPicker = ({
  id,
  name,
  currentValue,
  onValueChange: onColorChange,
  isOpen,
  onOpenChange,
}: ColorPickerProps) => {
  const [textColor, setTextColor] = useState('#ffffff');
  const [hsv, setHsv] = useState<{
    h: number;
    s: number;
    v: number;
    a: number;
  }>(() => {
    const [r, g, b, a] = parseHex(currentValue || '#ff0000');
    setTextColor(getTextColor(r, g, b, a));
    const [h, s, v] = rgbToHsv(r, g, b);
    return { h, s, v, a };
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const canvasWidth = 100;
  const radius = canvasWidth / 2;
  const angleRad = (hsv.h * Math.PI) / 180;
  const indicatorX = radius + radius * hsv.s * Math.cos(angleRad);
  const indicatorY = radius + radius * hsv.s * Math.sin(angleRad);

  const [pureR, pureG, pureB] = useMemo(
    () => hsvToRgb(hsv.h, hsv.s, hsv.v),
    [hsv.h, hsv.s, hsv.v],
  );

  const [pureHueHexString, setPureHueHexString] = useState(() =>
    formatHex(pureR, pureG, pureB, 1),
  );

  const [textInputValue, setTextInputValue] = useState(
    pureHueHexString.toUpperCase(),
  );

  useEffect(() => {
    if (isDraggingRef.current) return;

    const [r, g, b, a] = parseHex(currentValue || '#ff0000');
    setTextColor(getTextColor(r, g, b, a));
    const [newH, newS, newV] = rgbToHsv(r, g, b);

    setHsv((prev) => {
      const isGrayscale = r === g && g === b;
      const newHsv = {
        h: isGrayscale ? prev.h : newH,
        s: isGrayscale ? prev.s : newS,
        v: newV,
        a,
      };
      const [hueR, hueG, hueB] = hsvToRgb(newHsv.h, newHsv.s, 1);
      setPureHueHexString(formatHex(hueR, hueG, hueB, 1));
      return newHsv;
    });
  }, [currentValue]);

  // const getPixelByHsv = useCallback((hue: number, sat: number) => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   const canvasWidth = canvas.getBoundingClientRect().width;
  //   const radius = canvasWidth / 2;
  //   const clampedSat = Math.min(Math.max(sat, 0), 1);
  //   const angleRad = (hue * Math.PI) / 180;

  //   const dx = clampedSat * Math.cos(angleRad);
  //   const dy = clampedSat * Math.sin(angleRad);

  //   const canvasX = Math.round(dx * radius + radius);
  //   const canvasY = Math.round(dy * radius + radius);

  //   const px = (canvasY * canvas.width + canvasX) * 4;
  //   return { x: canvasX, y: canvasY, pixel: px };
  // }, []);

  const updateWheelPosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const radius = rect.width / 2;
      const x = clientX - rect.left - radius;
      const y = clientY - rect.top - radius;

      const distance = Math.hypot(x, y);
      const sat = Math.min(1, distance / radius);
      const angleRad = Math.atan2(y, x);
      const hue = ((angleRad * 180) / Math.PI + 360) % 360;

      const newHsv = { ...hsv, h: hue, s: sat };
      setHsv(newHsv);
    },
    [hsv],
  );

  const commitColor = useCallback(() => {
    setHsv((currentHsv) => {
      const [r, g, b] = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
      const hex = formatHex(r, g, b, currentHsv.a);
      setTextInputValue(hex.toUpperCase());
      onColorChange(hex);
      return currentHsv;
    });
  }, [onColorChange]);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateWheelPosition(e.clientX, e.clientY);
    },
    [updateWheelPosition],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      updateWheelPosition(e.clientX, e.clientY);
    },
    [updateWheelPosition],
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
        commitColor();
      }
    },
    [commitColor],
  );

  const handleValueChange = useCallback((newV: number) => {
    setHsv((prev) => ({ ...prev, v: newV }));
  }, []);

  const handleAlphaChange = useCallback((newAlpha: number) => {
    setHsv((prev) => ({ ...prev, a: newAlpha }));
  }, []);

  const handleSliderPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
        commitColor();
      }
    },
    [commitColor],
  );

  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = 100;

    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;

    const width = canvas.width;
    const radius = width / 2;
    const image = ctx.createImageData(width, width);
    const data = image.data;

    const feather = 1.5 * dpr;

    for (let y = -radius; y < radius; y++) {
      for (let x = -radius; x < radius; x++) {
        const dx = x / radius;
        const dy = y / radius;
        const dist = Math.hypot(x, y);
        const normalizedDist = Math.hypot(dx, dy);

        if (normalizedDist <= 1) {
          const angleRad = Math.atan2(dy, dx);
          const hue = ((angleRad * 180) / Math.PI + 360) % 360;
          const sat = Math.sqrt(normalizedDist);
          const rgb = hsvToRgb(hue, sat, 1);
          const px = ((y + radius) * width + (x + radius)) * 4;
          data[px] = rgb[0];
          data[px + 1] = rgb[1];
          data[px + 2] = rgb[2];

          const edgeDist = radius - dist;
          const alpha = Math.max(Math.min(edgeDist / feather, 1), 0);
          data[px + 3] = Math.round(255 * alpha);
        }
      }
    }

    ctx.putImageData(image, 0, 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setTextInputValue((prev) => prev.toUpperCase());
        const newColor = textInputValue;
        if (/^#([0-9A-Fa-f]{3}){1,2}([0-9A-Fa-f]{2})?$/.test(newColor)) {
          const [r, g, b, a] = parseHex(newColor);
          const [h, s, v] = rgbToHsv(r, g, b);
          setHsv(() => {
            onColorChange(formatHex(r, g, b, a));
            return { h, s, v, a };
          });
        }
      }
    },
    [onColorChange, textInputValue],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  useEffect(() => {
    drawColorWheel();
  }, [drawColorWheel]);

  const resetThumbClasses =
    'appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-runnable-track]:appearance-none [&::-moz-range-thumb]:appearance-none [&::-moz-range-track]:appearance-none';

  const thumbStyleClass = `${resetThumbClasses} [&::-webkit-slider-thumb]:clip-triangle-up [&::-webkit-slider-thumb]:translate-y-[150%] [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:border [&::-moz-range-thumb]:clip-triangle-up [&::-moz-range-thumb]:translate-y-[150%] [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:size-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border`;

  return (
    <div
      ref={rootRef}
      style={
        {
          '--current-color': currentValue,
          '--pure-color': pureHueHexString,
        } as CSSProperties
      }
      className='inline-block select-none'
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type='color'
        value={currentValue.slice(0, 7)}
        className='sr-only appearance-none'
      />
      <button
        type='button'
        onClick={() => onOpenChange(!isOpen)}
        aria-label='Toggle color picker'
        aria-expanded={isOpen}
        className='w-8 p-0.5 rounded-md bg-zinc-50 border border-zinc-200 size-auto'
      >
        <div className='h-3 rounded-md border border-zinc-200 bg-(--current-color)'></div>
      </button>
      <div
        className={`absolute right-0 bottom-6 p-3.5 rounded-md border border-zinc-200 bg-zinc-50 shadow-lg z-50 ${
          isOpen ? '' : 'hidden'
        }`}
      >
        <div className='grid grid-cols-[minmax(0fr,auto)_minmax(0fr,1fr)] grid-rows-[minmax(0fr,auto)_minmax(0fr,1fr)_minmax(0fr,1fr)] gap-2'>
          <div className='flex items-center justify-center min-h-0 min-w-0 relative'>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasWidth}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className='size-25 rounded-full col-start-1 row-start-1'
            ></canvas>
            <div
              className={`absolute size-3 rounded-full border-2 border-white shadow-sm pointer-events-none -translate-x-1/2 -translate-y-1/2`}
              style={{
                left: `${indicatorX}%`,
                top: `${indicatorY}%`,
                backgroundColor: currentValue,
              }}
            ></div>
          </div>
          <div className='relative flex items-center justify-center w-6 h-25 col-start-2 row-start-1'>
            <input
              type='range'
              min={0}
              max={1}
              step={0.01}
              value={hsv.v}
              onPointerDown={() => (isDraggingRef.current = true)}
              onPointerUp={handleSliderPointerUp}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className={`${thumbStyleClass} cursor-pointer -rotate-90 w-25 h-3 bg-linear-to-l from-(--pure-color) to-black origin-center border border-black`}
            />
          </div>
          <div className='relative flex items-center justify-center w-25 h-6 col-start-1 row-start-2'>
            <input
              type='range'
              min={0}
              max={1}
              step={0.01}
              value={hsv.a}
              onPointerDown={() => (isDraggingRef.current = true)}
              onPointerUp={handleSliderPointerUp}
              onChange={(e) => handleAlphaChange(Number(e.target.value))}
              className={`${thumbStyleClass} cursor-pointer rotate-180 w-25 h-3 bg-linear-to-l from-(--pure-color) to-(--pure-color)/0 origin-center border border-black`}
            />
          </div>
        </div>
        <div className='justify-self-start self-center'>
          <input
            type='string'
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              backgroundColor: currentValue,
              color: textColor,
            }}
            className='rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs tracking-wide w-full focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950'
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
