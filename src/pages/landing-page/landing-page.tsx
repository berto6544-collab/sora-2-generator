// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { ArrowBigDown,Coffee, ArrowBigUp, Play,Pause, Zap, Film, Image, Cpu } from 'lucide-react';
import AuthApi from '../../components/AuthApi';


export default function LandingPage() {

  const Auth = React.useContext(AuthApi);
  
/* @ts-ignore*/
const {dark,setDark} = Auth;
  const themePrimary = dark ? 'orange-400' : 'orange-600';
  const themeBg = dark ? 'bg-neutral-950 text-gray-100' : 'bg-orange-50 text-gray-900';
   const themeText = dark ? 'text-gray-100' : 'text-gray-900';
  const themeBorder = dark ? 'border-orange-500/30' : 'border-orange-600/30';
  const videoRef = React.useRef(null)



  return (
    <div className={`${themeBg} min-h-screen pt-20 flex flex-col items-center`}> 
      <main className="xl:w-7xl w-full lg:px-6 px-3 relative">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 relative">
          <div className='px-3 relative'>
            <h1 className={`text-5xl sm:text-6xl font-extrabold leading-tight text-${themePrimary} `}>
              Sora 2 Generator
            </h1>
            <p className={`mt-6 text-lg ${themeText} max-w-2xl`}>
              Create stunning videos from text and images using Sora 2, powered by your own OpenAI API key.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="/sora2/try" className={`inline-flex items-center justify-center px-6 py-3 rounded-full bg-${themePrimary} text-black font-semibold shadow ${themePrimary?'hover:bg-orange-500 bg-orange-600':'hover:bg-orange-500 bg-orange-600'}`}>Try Sora 2 Free</a>
              <a href="/sora2/videos" className={`inline-flex items-center justify-center px-6 py-3 rounded-full border border-${themePrimary} text-${themePrimary} hover:bg-orange-800/10`}>Find your videos</a>
            </div>

            <div className="mt-8 flex items-center gap-4">
              
              <div className={`text-sm ${themeText}`}>No installs, runs in your browser. Optimised for TikTok, YouTube Shorts, Instagram Reels.</div>
            </div>
          </div>

          <div className="order-first lg:order-last relative">
            <div className={`w-full rounded-2xl shadow-lg overflow-hidden ${dark ? 'bg-[#1a120b]' : 'bg-orange-100'} border ${themeBorder}`}>
              <div className={`p-4 border-b ${themeBorder} flex items-center justify-between`}>
                <div className="text-sm font-medium">Sora 2 Preview</div>
                <div className="text-xs text-gray-500">Video • 12s • 720x1280</div>
              </div>

              <div className="p-4">
                <div className="relative rounded-md group overflow-hidden" style={{ paddingTop: '56.25%' }}>
                  <video
                    src={'https://sora2.croudhive.com/upload/video_690ef1e76fe4819899d50a821d5d033509e82c428e50ce71.mp4'}
                    ref={videoRef}
                    playsInline
                    controls
                    className="absolute bg-black inset-0 w-full h-full object-scale"
                  />

                  
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  
                  {/*<div className="inline-flex items-center gap-2">
                    <VoteBadge themeText={themeText} themePrimary={dark} icon={<ArrowBigUp className={`text-${themePrimary}`}/>} label="Upvotes" value={"12k"} />
                    <VoteBadge themeText={themeText} themePrimary={dark} icon={<ArrowBigDown className={`text-${themePrimary}`}/>} label="Downvotes" value={"24"} />
                  </div>*/}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12 px-3">
          <h3 className="text-3xl text-center font-bold">What you can create</h3>
          <p className={`mt-2 text-center ${themeText}`}>Text-to-video, Image-to-video, multi-resolution exports and social-ready formats.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <FeatureCard themeText={themeText} themePrimary={dark} title="Text → Video" desc="Turn prompts into short, high-quality videos with animated camera movement." icon={<Film className={`text-${themePrimary}`}/>} />
            <FeatureCard themeText={themeText} themePrimary={dark} title="Image Input" desc="Provide an image to guide the generation character, background, or mood." icon={<Image className={`text-${themePrimary}`}/>} />
            <FeatureCard themeText={themeText} themePrimary={dark} title="Presets for Social" desc="TikTok, Instagram, YouTube presets (vertical/horizontal) with aspect and bitrate tuned." icon={<Zap className={`text-${themePrimary}`}/>} />
            <FeatureCard themeText={themeText} themePrimary={dark} title="Local & Fast" desc="Generate in the cloud with free tier access and quick iterations." icon={<Cpu className={`text-${themePrimary}`}/>} />
          </div>
        </section>

  
{/* Why Built Section */}
<section className="py-16 px-3 text-center">
<h3 className="text-3xl font-bold mb-4">Why I Built This Website</h3>
<p className={`max-w-3xl mx-auto ${themeText} text-lg`}>
I built this website to make it easier for everyone to use it. Normally, you need an invite code and a paid subscription to access Sora 2.
With this site, all you need is your own OpenAI API key. It removes all the barriers, no invites, no subscriptions, no complicated setups, everything in one simple place.
</p>


<div className="mt-8 flex flex-col items-center">
<p className={`text-sm mb-4 ${themeText}`}>If you like the project and want to support continued development:</p>
<a
href="https://www.buymeacoffee.com/robie012"
target="_blank"
rel="noopener noreferrer"
className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-300 text-black font-semibold shadow hover:bg-yellow-400`}
>
<Coffee className="w-5 h-5" /> Buy me a coffee
</a>
</div>
</section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to make something awesome?</h3>
          <p className={`${themeText} mb-8 max-w-2xl mx-auto`}>Sora 2 Generator lets you create, iterate, and export freely! the only limit is your OpenAI credits.</p>
          <div className="mt-8 flex flex-col justify-center sm:flex-row gap-4">
            <a href="/sora2/try" className={`inline-flex items-center justify-center px-6 py-3 rounded-full bg-${themePrimary} text-black font-semibold shadow ${themePrimary?'hover:bg-orange-500 bg-orange-600':'hover:bg-orange-500 bg-orange-600'}`}>Generate Now Free</a>
            <a href="/sora2/videos" className={`inline-flex items-center justify-center px-6 py-3 rounded-full ${dark?'':'hover:bg-orange-100'} border border-${themePrimary} text-${themePrimary}`}>Find your videos</a>
          </div>
        </section>

       

        
       
      </main>
    </div>
  );
}


interface FeatureCardProps {
  title?: string;
  desc?: string;
  icon?: React.ReactNode;
  themePrimary?: string | boolean;
  themeText?: string;
}


const FeatureCard: React.FC<FeatureCardProps> = ({
  title = "",
  desc = "",
  icon = null,
  themePrimary = "",
  themeText = "",
}) => {
  return (
    <div className={`${themePrimary?'bg-[#1a120b] text-orange-200':'bg-orange-100 text-orange-600 border border-orange-600/30'} rounded-xl p-6 shadow-sm border border-transparent hover:border-orange-500 transition`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md">
          {icon || <Film className="text-orange-400" />}
        </div>
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <p className={`mt-2 text-sm ${themeText}`}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
