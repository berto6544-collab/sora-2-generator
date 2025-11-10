import { useRef, useState, useEffect, useContext } from 'react';
import AuthApi from '../../components/AuthApi';

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(30);
  /* @ts-ignore */
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');
  /* @ts-ignore */
  const [scale, setScale] = useState(0.15);
  const [opacity, setOpacity] = useState(0.9);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // File handlers
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) setVideoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleLogoUpload({ target: { files: [file] } } as any);
  };

  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    if (logoRef.current) logoRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const logo = logoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || canvas.width;
    canvas.height = video.videoHeight || canvas.height;

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
      ctx.globalAlpha = 1.0;
    }

    // Update progress
    if (video.duration) setProgress(Math.min((video.currentTime / video.duration) * 100, 100));

    rafRef.current = requestAnimationFrame(drawFrame);
  };

  const stopDraw = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };

  const handleDownload = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    chunksRef.current = [];
    setProgress(0);

    const stream = canvasRef.current.captureStream(fps);
    /* @ts-ignore */
   const videoStream = videoRef.current?.captureStream ? videoRef.current?.captureStream() : null;

  // Combine canvas (video + logo) + original audio
  /* @ts-ignore */
  let combinedStream: MediaStream;
  if (videoStream && videoStream.getAudioTracks().length > 0) {
    combinedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...videoStream.getAudioTracks(),
    ]);
  } else {
    combinedStream = stream; // fallback if no audio
  }

    const possibleTypes = [
      'video/mp4;codecs=vp9',
      'video/mp4;codecs=vp8',
      'video/mp4;codecs=h264',
      'video/mp4',
      ''
    ];

    let mimeType = '';
    for (const type of possibleTypes) {
      if (type === '' || MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    let recorder: MediaRecorder;
    try { recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {}); }
    catch (err) { alert('Browser does not support this video format.'); stopDraw(); setDownloading(false); return; }

    recorderRef.current = recorder;

    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `logo-${Date.now()}.mp4`; a.click(); URL.revokeObjectURL(url);
      stopDraw(); setDownloading(false); setProgress(100);
    };

    videoRef.current.currentTime = 0;
    await videoRef.current.play();
    drawFrame();
    recorder.start();

    videoRef.current.onended = () => { recorder.stop(); stopDraw(); };
    setDownloading(true);
  };

  return (
    <div className={`${dark ? 'bg-neutral-950 text-neutral-100' : 'bg-orange-50 text-neutral-900'} ${videoFile?'':'min-h-screen'} py-30 px-5 flex justify-center`}>
      <div className={`max-w-6xl w-full p-8 rounded-3xl shadow-2xl ${dark ? 'bg-neutral-900 border-orange-600 border' : 'bg-orange-100 border-orange-200 border'}`}>
        <h2 className="text-3xl font-extrabold text-orange-600 mb-2">Video Watermark Downloader</h2>
        <p className="mb-6">Add a watermark by uploading your video and logo</p>

        {/* Video Upload */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className={`w-full p-4 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50 border-orange-600' : 'bg-orange-50 text-black border-orange-300'} cursor-pointer`}
          />
          {videoFile && <p className="mt-2 text-sm" style={{wordBreak:'break-all'}}>{videoFile.name}</p>}
          {videoPreview && <video src={videoPreview} playsInline controls muted className="mt-2 h-100 bg-black object-scale w-full rounded-xl shadow-md" />}
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
          <label>Logo Opacity: <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="ml-2" /></label>
          <label>FPS: <input type="number" min={1} max={60} value={fps} onChange={e => setFps(Number(e.target.value) || 30)} className="ml-2 w-16 p-1 border rounded" /></label>
          <button onClick={handleDownload} disabled={!videoFile || downloading} className="px-4 cursor-pointer py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50">
            {downloading ? 'Processing...' : 'Download'}
          </button>
        </div>

        {/* Progress Bar */}
        {downloading && (
          <div className="w-full bg-gray-300 rounded h-4 mb-4">
            <div
              className="bg-orange-600 h-4 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <video ref={videoRef} muted playsInline controls style={{ display: 'none', width: '100%', height: 450, objectFit: 'scale-down' }} />
        <canvas ref={canvasRef} style={{ display: 'none', width: '100%', marginTop: '1rem' }} />
        <img ref={logoRef} alt="logo" style={{ display: 'none' }} />
      </div>
    </div>
  );
}
