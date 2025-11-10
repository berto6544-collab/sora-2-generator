import React from "react";
import AuthApi from "./AuthApi";
// @ts-ignore
import { reactLocalStorage } from "reactjs-localstorage";
const NavBar = () =>{
const Auth = React.useContext(AuthApi);
/* @ts-ignore*/
const {dark,setDark,remove} = Auth;


const setTheme = () => {
   
    
    setDark(!dark)
    

    if (dark == false) {
     
    
      

       document.body.style.backgroundColor = '#171717';
      document.body.style.color = 'white';
      reactLocalStorage.set('dark',dark)
      
      reactLocalStorage.set('theme','dark')
      
    } else {
      
      reactLocalStorage.set('dark',dark)
      reactLocalStorage.set('theme','light')
     
     document.body.style.backgroundColor = '#FFF7ED';
      document.body.style.color = 'black';
      
    }

  }; 


  const themeBg = dark ? 'bg-neutral-700/20 text-gray-100' : 'bg-orange-200/20 text-gray-900';
  
 {/* @ts-ignore*/}
return(
    <div className={`w-full ${themeBg} h-15 p-4 flex items-center backdrop-blur-xs gap-2 justify-between fixed top-0 z-10`}>
        <div></div>

        <div className={`flex items-center gap-5`}>



           {/* @ts-ignore*/}
            {/*<a href="https://www.buymeacoffee.com/robie012" target="_blank" className={`border-3 border-transparent overflow-hidden hover:border-orange-600 rounded-lg`}>
              //@ts-ignore
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{height: '40px',objectFit:'scale-down'}} ></img>
            </a>*/}

            <a href={'/doc/api'} className={`${dark == false?'text-orange-950 hover:text-orange-600 border-orange-950 hover:border-orange-600':'text-orange-50 hover:text-orange-300 border-orange-50 hover:border-orange-300'}  text-sm rounded-md border p-2`}>API Doc</a>
            {remove == false?<button onClick={() => {
              
              setTheme();

            }} aria-label="toggle theme" className={`p-2 flex cursor-pointer flex-0 rounded-full hover:bg-orange-600/20`}>
                {dark ? '🌙' : '🌞'}
              </button>:null}

              
            
            </div>

    </div>
)

}

export default NavBar;