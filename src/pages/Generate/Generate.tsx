import React, { useState, useRef } from 'react';
import AuthApi from '../../components/AuthApi';
import Cookies from 'js-cookie';



export default function Sora2VideoGeneratorOrange() {
   const Auth = React.useContext(AuthApi);
/* @ts-ignore*/
const {dark,setDark} = Auth;

  const [apiKey, setApiKey] = useState(Cookies.get('apikey') || '');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('4');
  const [durationType, setDurationType] = useState('4');
  const [platform, setPlatform] = useState('TikTok');

  const [progress, setProgress] = useState(null);
  const [id, setId] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
   const [imageFile, setImageFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [model,setModel] = useState('sora-2')
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const durationOptions = {
    'sora-2': ['4', '8', '12'],
    'sora-2-pro':['5','10','15']

  };
  const platformResolutions = {
    TikTok: '720x1280',
    Instagram: '720x1280',
    YouTube: '1280x720',
    Shorts: '720x1280',
    Portrait: '1792×1024',
    Landscape:'1024x1792',
  };
  const models = ['sora-2','sora-2-pro'];



  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
     /* @ts-ignore*/
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
       
      reader.onloadend = () =>{ 
       {/* @ts-ignore*/} 
        setImagePreview(reader.result);
        {/* @ts-ignore*/}
        setImageBase64(reader.result.split(',')[1]);
    }
      reader.readAsDataURL(file);

    }
  };

   {/* @ts-ignore*/}
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    {/* @ts-ignore*/}
    if (file) handleImageUpload({ target: { files: [file] } });
  };

   {/* @ts-ignore*/}
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  
const generateVideo = async () => {
   const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/app"
    : "/app";


  if (!apiKey || !prompt) {
    alert('Please enter your API key and a prompt.');
    return;
  }

  setLoading(true);
   {/* @ts-ignore*/}
  setError(null);
   {/* @ts-ignore*/}
  setVideoUrl(null);

  try {

    const formData = new FormData();

  Cookies.set('apikey',apiKey);
  formData.append("apiKey", apiKey);
  formData.append("prompt", prompt);
  formData.append("duration", duration);
  formData.append("platform", platform);
  formData.append("model", model);

  /* @ts-ignore*/
  formData.append("size", platformResolutions[platform]);
  /* @ts-ignore*/
  formData.append("width", platformResolutions[platform]);
  /* @ts-ignore*/
   formData.append("height", platformResolutions[platform]);
/* @ts-ignore*/
  formData.append("image", imageFile); // <-- append the actual File

    const res = await fetch(`${baseUrl}/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        prompt,
        duration,
        platform,
        /* @ts-ignore*/
        size:platformResolutions[platform],
        /* @ts-ignore*/
        width: platformResolutions[platform].width,
        /* @ts-ignore*/
        height: platformResolutions[platform].height,
        image:imageBase64,
        model:model
      })
    });

    const data = await res.json();
    
      if(data){
      if(data.status != "completed"){
        setProgress(data.progress)
        setId(data.id)
        checkStatus(data.id)
      }else{
        
      }
    }
      
      //setVideoUrl(data.data[0].statusurl);
    
    
    
    
    
    

  } catch (err) {
    console.error(err);
    setError('Error: ' + err);
  } finally {
    setLoading(false);
  }
};


/* @ts-ignore*/
async function checkStatus(videoId) {
  try {
     const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/app"
    : "/app";
    const res = await fetch(`${baseUrl}/video-status/${videoId}`, {
        method:'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
    const data = await res.json();

    
    if (data.status !== "completed") {
      if(data.status == "failed") return console.log("Failed to processed!");
      console.log("Still processing... checking again in 5 seconds");
      setTimeout(()=>{checkStatus(data.id)}, 5000);
      setProgress(data.progress)
      
    } else {
      setProgress(data.progress)
      setVideoUrl(data.url)
      return
      
    }
  } catch (err) {
    console.error("Error checking status:", err);
    setTimeout(()=>{checkStatus(id)}, 5000); // retrying after 5 seconds if failed
  }
}


  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'sora2-video.mp4';
    a.click();
  };

  /* @ts-ignore*/
  const shareVideo = (platform) => {
    alert(`Shared to ${platform}!`);
  };

  


  return (
    <div className={`${dark?'bg-neutral-950 text-neutral-100':'bg-orange-50 text-neutral-900'} py-30 md:px-5 px-2 flex justify-center`}>
      <div className={`max-w-6xl w-full border ${dark ? 'bg-neutral-900 border-gray-700' : 'bg-white/40 border-gray-300'} md:p-8 p-4 md:rounded-3xl rounded-xl `}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-orange-600">Sora 2 Video Generator</h1>
          
        </div>

        <div className={`bg-white/10 border ${dark?'border-gray-600':'border-gray-300'} rounded-xl p-4 mb-8 text-sm leading-relaxed text-gray-700`}>
          <h2 className="font-semibold text-orange-600 mb-2">How to Use Your OpenAI API Key:</h2>
          <ol className={`list-decimal list-inside ${dark?'text-orange-50':'text-black'} space-y-1`}>
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className={`${dark?'text-gray-200 hover:text-gray-300':'text-gray-600 hover:text-gray-700'} underline`}>OpenAI API Keys page</a>.</li>
            <li>Log in and click <strong>“Create new secret key”</strong>.</li>
            <li>Copy your API key (starts with <code>sk-...</code>).</li>
            <li>Paste it below in the input field labeled “OpenAI API Key”.</li>
            <li>Then, type your prompt and click <strong>Generate Video</strong>.</li>
          </ol>
          <div className={`flex flex-col items-start pt-4 mt-4 border-t ${dark?'border-neutral-600 text-neutral-200':'border-gray-300 text-black'}`}>
          <b>💡 Tip:</b>
          Make sure your OpenAI account has enough credits or a payment method added! otherwise, video generation won’t work.
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={`w-full p-3 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50 border-gray-600' : 'bg-gray-100 text-black border-gray-300'} focus:ring-2 focus:ring-orange-600`}
            placeholder="Paste your OpenAI API key here"
          />
        </div>

        <div className="mb-6">
          <label className={`block mb-2 font-medium ${dark?'text-orange-50':'text-black'}`}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={`w-full p-3 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50 border-gray-600' : 'bg-gray-100 text-black border-gray-300'} border focus:ring-2 focus:ring-orange-500`}
            /* @ts-ignore*/
            rows="4"
            placeholder="Describe your scene..."
          />
        </div>

        <div className="mb-6">
          <div className="w-full flex items-center gap-2 justify-between">
            <div className="w-full flex items-center gap-2 justify-between">
          <label className={`block mb-2 font-medium ${dark?'text-orange-50':'text-black'}`}>Models</label>
         <span>per sec/${((platform == "Portrait" || platform == "Landscape"?0.50 : model == "sora-2"?0.10: 0.30)).toFixed(2)}</span>
         
         </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {models.map((d) => (
              <button
                key={d}
                onClick={() =>{
                  
                  setModel(d)
                  if(d =="sora-2"){
                  setDurationType('4')
                  setDuration('4')
                  }else{
                  setDurationType('5')
                  setDuration('5')
                  }
                  
                  
                
                }}
                className={`px-5 py-2 cursor-pointer rounded-xl font-semibold transition ${model === d ? 'bg-orange-500 text-white shadow-lg' : `${dark?'bg-neutral-700 text-neutral-200 hover:bg-orange-400 hover:text-neutral-900':'bg-neutral-200 text-neutral-800 hover:bg-orange-400'}`}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full flex items-center gap-2 justify-between">
          <label className={`block mb-2 font-medium ${dark?'text-orange-50':'text-black'}`}>Duration (seconds)</label>
          
          <span>${(Number(duration) * (platform == "Portrait" || platform == "Landscape"?0.50:model == "sora-2"?0.10 : 0.30)).toFixed(2)}</span>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {
            /* @ts-ignore*/
            durationOptions[model].map((d) => (
              <button
                key={d}
                onClick={() =>{
                    setDurationType(d)
                    if(d == "Custom"){


                    }else{
                    setDuration(d)
                    }


                }}
                className={`px-5 py-2 cursor-pointer rounded-xl font-semibold transition ${durationType === d ? 'bg-orange-500 text-white shadow-lg' : `${dark?'bg-neutral-700 text-neutral-200 hover:bg-orange-400 hover:text-neutral-900':'bg-neutral-200 text-neutral-800 hover:bg-orange-400'}`}`}
              >
                {d} sec
              </button>
            ))}
          </div>
        </div>

        {durationType == "Custom"?<div className="mb-6">
        
        <label className="block mb-2 font-medium">Custom Duration</label>
          <input
            type={'number'}
            value={duration}
            /* @ts-ignore*/
            onChange={(e) => setDuration(e.target.valueAsNumber)}
            className={`w-full p-3 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50' : 'bg-orange-100 text-black'} focus:ring-2 focus:ring-orange-500`}
            placeholder="Custom Seconds"
          />
        </div>:null}

        <div className="mb-6">
          <label className={`block mb-2 font-medium ${dark?'text-orange-50':'text-black'}`}>Platform / Resolution</label>
          <div className="flex gap-3 flex-wrap">
            {Object.keys(platformResolutions).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-5 py-2 rounded-xl font-semibold cursor-pointer transition ${platform === p ? 'bg-orange-500 text-white shadow-lg' : `${dark?'bg-neutral-700 text-neutral-200 hover:bg-orange-400 hover:text-neutral-900':'bg-neutral-200 text-neutral-800 hover:bg-orange-400'}`}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className={`block mb-2 font-medium ${dark?'text-orange-50':'text-black'}`}>Optional Image Upload</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            /* @ts-ignore*/
            onClick={() => document.getElementById('imageInput').click()}
            className={`w-full p-6 border-2 border-dashed rounded-xl cursor-pointer text-center ${dark ? 'bg-neutral-800 border-gray-600 hover:border-gray-500' : 'bg-gray-100 border-gray-300 hover:border-gray-400'}`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="mx-auto max-h-60 object-contain rounded-lg shadow" />
            ) : (
              <p className={`${dark?'text-orange-50':'text-black'}`}>Drag & drop an image here, or click to select</p>
            )}
            <input type="file" accept="image/*" id="imageInput" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        {
      progress != null?<div className={`w-full h-8 rounded-md relative overflow-hidden flex items-center bg-orange-50`}>
      <span style={{width:`${progress}%`}} className={`h-full rounded-md left-0 absolute overflow-hidden flex items-center ${progress >= 95 && progress <= 100?"bg-green-500":`bg-orange-500`}`}>
      </span>
      
      <div className={`p-2 flex items-center z-2 w-full justify-between`}>
      <span >processing</span>
      <span >{progress}%</span>
      </div>

      </div>:null  
      }

        <div className="flex gap-5 mt-4">
          <button
            onClick={generateVideo}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow-lg hover:bg-orange-600 transition"
          >
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
          <button
            onClick={downloadVideo}
            disabled={!videoUrl}
            className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition"
          >
            Download Video
          </button>
        </div>

        {error && <div className="text-red-600 font-medium mt-3">{error}</div>}

        {videoUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-3 text-orange-600">Video Preview</h2>
            <video ref={videoRef} src={videoUrl} controls className="w-full h-[400px] object-scale bg-black rounded-2xl shadow-lg mb-4" />

            {/*<h3 className="text-lg font-semibold mb-2 text-orange-500">Share</h3>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => shareVideo('TikTok')} className="px-4 py-2 bg-pink-500 text-white rounded-xl shadow hover:bg-pink-600 transition">TikTok</button>
              <button onClick={() => shareVideo('YouTube')} className="px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition">YouTube</button>
              <button onClick={() => shareVideo('Instagram')} className="px-4 py-2 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600 transition">Instagram</button>
            </div>*/}
          </div>
        )}
      </div>
    </div>
  );
}