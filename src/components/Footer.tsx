import { Coffee } from "lucide-react"
import AuthApi from "./AuthApi"
import React from "react"

 const Footer = () =>{
 const Auth = React.useContext(AuthApi);
 // @ts-ignore
 const {dark} = Auth;

return(
    <footer className={`w-full ${dark?'bg-neutral-950 text-gray-100 border-t border-neutral-800':'bg-orange-50 text-neutral-900 border-t border-orange-200/70'} py-8 text-sm`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
            <div>© {new Date().getFullYear()} Sora 2 Generator Free</div>
            {<div className="flex gap-4 mt-4 items-center md:mt-0">
             <a
href="https://www.buymeacoffee.com/robie012"
target="_blank"
rel="noopener noreferrer"
className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-300 text-black font-semibold shadow hover:bg-yellow-400`}
>
<Coffee className="w-5 h-5" /> Buy me a coffee
</a>

          
            </div>}
          </div>
        </footer>
)

    
}

export default Footer