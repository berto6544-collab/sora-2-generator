import { useRef, useState, useEffect, useContext } from 'react';
import AuthApi from '../../components/AuthApi';

function isSafariBrowser() {
  const ua = navigator.userAgent || '';
  // iOS detection (iPhone/iPad) and Safari desktop
  const isIOS = /iP(ad|hone|od)/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua);
  return isIOS || isSafari;
}

export default function VideoWatermarkDownloader() {
  const Auth = useContext(AuthApi);
  /* @ts-ignore */
  const { dark } = Auth;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
   /* @ts-ignore */
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(60);
  /* @ts-ignore */
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');
  /* @ts-ignore */
  const [scale, setScale] = useState(0.15);
  const [opacity, setOpacity] = useState(0.9);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safari = isSafariBrowser();

  // File handlers
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    setError(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
      }
      // revoke will be done in cleanup effect when file changes or component unmounts
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);

      const url = URL.createObjectURL(file);
      if (logoRef.current) logoRef.current.src = url;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      handleLogoUpload({ target: { files: [file] } } as any);
    } else if (file.type.startsWith('video/')) {
      handleVideoUpload({ target: { files: [file] } } as any);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup created object URLs
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      stopDraw();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DRAW loop (kept separate so we can call it for preview and recording)
  const drawOnce = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const logo = logoRef.current;

     /* @ts-ignore */
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // set canvas size to video size
    const vw = video.videoWidth || video.clientWidth || 640;
    const vh = video.videoHeight || video.clientHeight || 360;
    canvas.width = vw;
    canvas.height = vh;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (logo && logo.complete && logo.naturalWidth > 0) {
      const shortSide = Math.min(canvas.width, canvas.height);
      const logoW = shortSide * scale;
      const logoH = logoW * (logo.naturalHeight / logo.naturalWidth);

      let x = 10, y = 10;
      switch (position) {
        case 'top-left': x = 10; y = 10; break;
        case 'top-right': x = canvas.width - logoW - 10; y = 10; break;
        case 'bottom-left': x = 10; y = canvas.height - logoH - 10; break;
        case 'bottom-right': x = canvas.width - logoW - 10; y = canvas.height - logoH - 10; break;
        case 'center': x = (canvas.width - logoW) / 2; y = (canvas.height - logoH) / 2; break;
      }

      ctx.globalAlpha = opacity;
      ctx.drawImage(logo, x, y, logoW, logoH);
      ctx.globalAlpha = 1;
    }
  };

  const drawLoop = () => {
    drawOnce();
    rafRef.current = requestAnimationFrame(drawLoop);
  };

  const stopDraw = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Mime selection utility
  const chooseMimeType = (preferAudio: boolean) => {
    // preferAudio = true for combined recording (video+audio)
    const candidates = preferAudio
      ? [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp8',
      ]
      : [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];

    for (const m of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
        return m;
      }
    }
    // last-ditch: plain webm if supported by MediaRecorder (some browsers)
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/webm')) {
      return 'video/webm';
    }
    return null;
  };

  const handleDownload = async () => {
    setError(null);
    if (!videoRef.current || !canvasRef.current) {
      setError('Video or canvas not ready.');
      return;
    }

    // Ensure user gesture allowed playback (some mobile browsers require user interaction)
    try {
      // reset progress & fragments
      chunksRef.current = [];
      setProgress(0);
      setDownloading(false);

      const canvas = canvasRef.current!;
      const video = videoRef.current!;
       /* @ts-ignore */
      const logo = logoRef.current;

      // Ensure video is ready
      if (video.readyState < 2) {
        // try to load
        await video.play().catch(() => { /* ignore play rejection here */ });
        video.pause();
      }

      // Start drawing frames to canvas
      drawLoop();

      // Build stream(s)
      const canvasStream = canvas.captureStream(Math.max(1, fps));
      let combinedStream: MediaStream;

      // On non-Safari, try to get audio from video.captureStream()
      let audioTracks: MediaStreamTrack[] = [];
      if (!safari) {
        try {
          // some browsers only provide audio tracks after playback; ensure playback started
          await video.play().catch(() => { /* ignore autoplay block - we'll rely on user gesture earlier */ });
          const vs = (video as any).captureStream ? (video as any).captureStream() : null;
          if (vs) {
            audioTracks = vs.getAudioTracks();
          }
        } catch (err) {
          // ignore
          audioTracks = [];
        }
      } else {
        // Safari: do not try to get audioTracks - it's unreliable / blocked
        audioTracks = [];
      }

      if (audioTracks.length > 0) {
        combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
      } else {
        // no audio available — record canvas only
        combinedStream = canvasStream;
      }

      // choose MIME
      const mime = chooseMimeType(audioTracks.length > 0);
      if (!mime) {
        stopDraw();
        setError('No supported MediaRecorder mime type found in this browser. Safari may require server-side processing.');
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        stopDraw();
        setError('MediaRecorder is not available in this browser. Safari (older) may not support it.');
        return;
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType: mime });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          // update progress heuristically (not exact)
          setProgress((prev) => Math.min(prev + 2, 98));
        }
      };

      recorder.onerror = (ev) => {
        console.error('MediaRecorder error', ev);
        setError('Recording error: ' + (ev as any).error?.message || 'unknown');
      };

      recorder.onstart = () => {
        setDownloading(true);
      };

      recorder.onstop = () => {
        // create final blob
        const blob = new Blob(chunksRef.current, { type: mime.includes('webm') ? 'video/webm' : 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // For Safari we recorded canvas only (no audio). If you want audio on Safari,
        // you'll need to upload original files to server and merge there.
        const a = document.createElement('a');
        a.href = url;
        // prefer mp4 extension for compatibility with players; webm is fine if recorded as webm
        a.download = mime.includes('webm') ? `watermarked-${Date.now()}.webm` : `watermarked-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        stopDraw();
        setDownloading(false);
        setProgress(100);
      };

      // Start recording
      try {
        recorder.start();
      } catch (err) {
        console.error('recorder.start() failed', err);
        stopDraw();
        setError('Unable to start recorder. Browser may block recording (Safari limitations).');
        return;
      }

      // If we have audio tracks and the video was paused, ensure playback so the audio stream forwards
      if (audioTracks.length > 0 && video.paused) {
        try {
          await video.play();
        } catch (_) { /* ignore play error; user gesture needed */ }
      }

      // Stop when video ends OR set a manual fallback timeout (in case)
      const onEnded = () => {
        try {
          if (recorder.state === 'recording') recorder.stop();
        } catch (_) {}
      };
      video.addEventListener('ended', onEnded);

      // Safety: if video has no "ended" or user stops, provide manual stop when it reaches duration
      const watchProgress = setInterval(() => {
        if (!video.duration || video.duration === Infinity) return;
        // update progress
        setProgress(Math.min(100, Math.floor((video.currentTime / video.duration) * 100)));
        if (video.currentTime >= video.duration && recorder.state === 'recording') {
          try { recorder.stop(); } catch (_) {}
        }
      }, 250);

      // Cleanup when recording stops
      recorder.onstop = () => {
        clearInterval(watchProgress);
        video.removeEventListener('ended', onEnded);
        // create final blob
        const blob = new Blob(chunksRef.current, { type: mime.includes('webm') ? 'video/webm' : 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mime.includes('webm') ? `watermarked-${Date.now()}.webm` : `watermarked-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        stopDraw();
        setDownloading(false);
        setProgress(100);
      };

    } catch (err: any) {
      console.error(err);
      stopDraw();
      setDownloading(false);
      setError('Unexpected error: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className={`${dark ? 'bg-neutral-950 text-neutral-100' : 'bg-orange-50 text-neutral-900'} ${videoFile ? '' : 'min-h-screen'} py-30 px-5 flex justify-center`}>
      <div className={`max-w-6xl w-full p-8 rounded-3xl shadow-2xl ${dark ? 'bg-neutral-900 border-orange-600 border' : 'bg-orange-100 border-orange-200 border'}`}>
        <h2 className="text-3xl font-extrabold text-orange-600 mb-2">Video Watermark Downloader</h2>
        <p className="mb-2">Add a watermark by uploading your video and logo</p>
        <p className="mb-4 text-sm">This component will try to include audio (Chrome/Android). On Safari, final download will be video-only (muted) due to browser limitations.</p>

        {/* Video Upload */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className={`w-full p-4 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50 border-orange-600' : 'bg-orange-50 text-black border-orange-300'} cursor-pointer`}
          />
          {videoFile && <p className="mt-2 text-sm" style={{ wordBreak: 'break-all' }}>{videoFile.name}</p>}
          {videoPreview && <video ref={videoRef} muted={true} src={videoPreview} playsInline controls className="mt-2 bg-black w-full h-100 rounded-xl shadow-md" />}
        </div>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Logo File</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('logoInput')?.click()}
            className={`w-full p-6 border-2 border-dashed rounded-xl cursor-pointer text-center hover:border-orange-400 transition ${dark ? 'bg-neutral-800 border-orange-600' : 'bg-orange-50 border-orange-300'}`}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" className="mx-auto max-h-40 object-contain rounded-lg shadow" />
            ) : (
              <p className={`${dark ? 'text-orange-50' : 'text-black'}`}>Drag & drop a logo here or click to select</p>
            )}
            <input type="file" id="logoInput" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center justify-between w-full flex-wrap mb-4">
          <label>Logo Opacity:
            <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="ml-2" />
          </label>

          <label>FPS:
            <input type="number" min={1} max={60} value={fps} onChange={e => setFps(Number(e.target.value) || 60)} className="ml-2 w-16 p-1 border rounded" />
          </label>

          <div className="flex gap-2">
            <select value={position} onChange={e => setPosition(e.target.value as any)} className="p-1 border rounded">
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="center">Center</option>
            </select>

            <input type="number" step={0.01} min={0.02} max={0.8} value={scale} onChange={e => setScale(Number(e.target.value) || 0.15)} className="w-20 p-1 border rounded" />
            <button onClick={handleDownload} disabled={!videoFile || downloading} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50">
              {downloading ? 'Processing...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {downloading && (
          <div className="w-full bg-gray-300 rounded h-4 mb-4">
            <div className="bg-orange-600 h-4 rounded transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{error}</div>}

        {/* Hidden canvas / logo for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <img ref={logoRef} alt="logo" style={{ display: 'none' }} />
      </div>
    </div>
  );
}
