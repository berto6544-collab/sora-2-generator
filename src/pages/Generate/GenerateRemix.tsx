import React, { useState, useRef } from 'react';
import AuthApi from '../../components/AuthApi';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Clapperboard, Download } from 'lucide-react';



export default function Sora2VideoGeneratorOrange() {
   const Auth = React.useContext(AuthApi);
/* @ts-ignore*/
const {dark,setDark} = Auth;
const {video_id} = useParams();

  const [apiKey, setApiKey] = useState(Cookies.get('apikey')||'');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('4');
  const [durationType, setDurationType] = useState('4');
  const [platform, setPlatform] = useState('TikTok');
  const [dataSource, setDataSource] = useState([]);

  const [progress, setProgress] = useState(null);
  const [id, setId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [model,setModel] = useState('sora-2')
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const durationOptions = {
    'sora-2': ['4', '8', '12'],
    'sora-2-pro':['4','8','12']

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

React.useEffect(()=>{

  

  if(video_id)
fetch(`https://sora2.croudhive.com/app/videos/${video_id}`,{
  method:'GET',
        headers: {
          'Authorization': Cookies.get('apikey')?`Bearer ${Cookies.get('apikey')}`:'',
        },
})
  .then(res=>res.json())
  .then(response=>{
    if(response?.data){
      if(response.data.length == 0)return;
      setDataSource(response.data)
      
    }
  });


},[]) 

 

  
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
  formData.append("apiKey", apiKey);
  formData.append("prompt", prompt);
  formData.append("duration", duration);
  formData.append("platform", platform);
  formData.append("model", model);
  /* @ts-ignore*/
  formData.append('id',video_id)
  /* @ts-ignore*/
  formData.append("size", platformResolutions[platform]);
  /* @ts-ignore*/
  formData.append("width", platformResolutions[platform]);
  /* @ts-ignore*/
   formData.append("height", platformResolutions[platform]);


    const res = await fetch(`${baseUrl}/generate-video/remix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        prompt,
        duration,
        id:video_id,
        platform,
        /* @ts-ignore*/
        size:platformResolutions[platform],
        /* @ts-ignore*/
        width: platformResolutions[platform].width,
        /* @ts-ignore*/
        height: platformResolutions[platform].height,
        model:model
      })
    });

    const data = await res.json();
    

      if(data){
      if(data.error) return;
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
      setVideoUrl(`https://sora2.croudhive.com/upload/${data.id}.mp4`)
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
          <h1 className="text-3xl font-extrabold text-orange-600">Remix Sora 2 Video</h1>
          
        </div>

        {/*<div className={`bg-white/10 border ${dark?'border-gray-600':'border-gray-300'} rounded-xl p-4 mb-8 text-sm leading-relaxed text-gray-700`}>
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
        </div>*/}


        {dataSource.length >0?
        <div className={`w-full flex flex-col items-center gap-2 mb-6`} >
          <video src={`https://sora2.croudhive.com/upload/${video_id}.mp4`} controls playsInline className={`w-full h-[450px] bg-black object-scale rounded-lg`}></video>
          {/*@ts-ignore*/}
          <p>{dataSource[0].prompt}</p>
        </div>:null}


        {apiKey == ""?<div className="mb-6">
          <label className="block mb-2 font-medium">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={`w-full p-3 border rounded-xl ${dark ? 'bg-neutral-800 text-orange-50 border-gray-600' : 'bg-gray-100 text-black border-gray-300'} focus:ring-2 focus:ring-orange-600`}
            placeholder="Paste your OpenAI API key here"
          />
        </div>:null}

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

            <div className="flex gap-3 flex-wrap">
            
            <a 
               // @ts-ignore
              href={`/sora2/remix/${id}`} 
              className={`flex items-center gap-2 text-gray-400 hover:text-gray-500 font-semibold`} > 
              <Clapperboard size={20} /> Remix</a>
              
              <button
                onClick={downloadVideo}
                className="flex items-center cursor-pointer gap-2 p-2 rounded-lg text-gray-400 hover:text-gray-500 font-semibold"
              >
                <Download size={20} /> Download
                
              </button>
            
            
            </div>
          </div>
        )}
      </div>
    </div>
  );
}