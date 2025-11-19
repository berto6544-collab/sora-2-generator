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
            <div className="flex gap-4 mt-4 items-center md:mt-0">
          
            </div>
          </div>
        </footer>
)

    
}

export default Footer