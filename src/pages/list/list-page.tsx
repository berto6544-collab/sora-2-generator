import  React,{ useState} from 'react';
import { Loader2, Download } from 'lucide-react';
import AuthApi from '../../components/AuthApi';

export default function Sora2VideoList() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('soraApiKey') || '');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // @ts-ignore
  const [searchTerm, setSearchTerm] = useState('');

   const Auth = React.useContext(AuthApi);
/* @ts-ignore*/
const {dark,setDark} = Auth;
const themeText = dark ? 'text-gray-100' : 'text-gray-900';



  const fetchVideos = async () => {
  const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/app"
    : "/app";

    if (!apiKey) {
      alert('Please enter your API key first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/videos/`, {
        method:'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos. Please check your API key.');
      }

      const data = await response.json();

       // @ts-ignore
      if(data.error) return setError(data.details);
        
      setVideos(data.data || []);
      
    

    } catch (err) {
      // @ts-ignore
      setError(err);
    } finally {
      setLoading(false);
    }
  };



// @ts-ignore
  const handleDownload = async(video) =>{



  }

  return (
    <div className={`${dark ? 'bg-neutral-950 text-neutral-100' : 'bg-orange-50 text-neutral-900'} ${videos.length == 0?'min-h-screen':''} flex flex-col items-center md:p-8 p-3 pt-30`}> 
      <div className="flex justify-between w-full mb-6 mt-15">
        <h1 className="text-3xl font-bold text-orange-600">View All Generated Videos</h1>
        
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full">
        <input
          type="password"
          placeholder="Enter your OpenAI API key"
          className={`px-4 py-2 rounded-lg w-80 ${dark ? 'bg-neutral-800 text-orange-50 border-1 border-orange-600' : 'bg-orange-50 text-black border-1 border-orange-600'}`}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        {/*<input
          type="text"
          placeholder="Search by video ID"
          className={`px-4 py-2 rounded-lg w-80 ${dark ? 'bg-neutral-800 text-orange-50 border-1 border-orange-600' : 'bg-orange-50 text-black border-1 border-orange-600'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />*/}
        <button
          onClick={fetchVideos}
          className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-xl font-semibold"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Fetch Videos'}
        </button>

      </div>

      {error && <p className="text-red-600 mb-4 w-full flex items-start">⚠️ {error}</p>}
      {loading && <p>Loading videos...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div 
            // @ts-ignore
            key={video.id} className={`${dark ? 'bg-neutral-900 border border-orange-600/40' : 'bg-orange-100 border border-orange-200'} rounded-xl p-4 flex flex-col items-center`}> 
              <video
                // @ts-ignore
                src={`https://sora2.croudhive.com/upload/${video.id}.mp4`}

                controls
                // @ts-ignore
                poster={`https://sora2.croudhive.com/upload/${video.id}_thumnail.png`}
                
                className="rounded-lg mb-3 w-full h-70 bg-black"
              />
              <div className={`flex justify-between w-full text-sm ${themeText} mb-2 wrap`}> 
                {/* @ts-ignore*/}
                <span style={{wordBreak:'break-all'}}>ID: {video.id}</span>
                {/* @ts-ignore*/}
                {/*<span>{new Date(video.created * 1000).toLocaleString()}</span>*/}
              </div>
              <button
                onClick={()=> handleDownload(video)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold"
              >
                <Download size={16} /> Download
              </button>
            </div>
          ))
        ) : (
          !loading && <p>No videos found.</p>
        )}
      </div>
    </div>
  );
}
