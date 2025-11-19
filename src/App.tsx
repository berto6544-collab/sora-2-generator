import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  //Navigate,
  //useLocation,
  //Link,
} from "react-router-dom";
// @ts-ignore
import { reactLocalStorage } from "reactjs-localstorage";
// @ts-ignore
import Cookies from "js-cookie";
import AuthApi from "./components/AuthApi";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";



const GeneratePage = React.lazy(() => import("./pages/Generate/Generate"));
const GenerateRemixPage = React.lazy(() => import("./pages/Generate/GenerateRemix"));
const ListPage = React.lazy(() => import("./pages/list/list-page"));
const WatermarkPage = React.lazy(() => import("./pages/watermark-logo-page/Watermark-logo-page"));
const LandingPage = React.lazy(() => import("./pages/landing-page/landing-page"));
const APIPage = React.lazy(() => import("./pages/api-page/Api-page"));





function App() {

  
  const [auth, setAuth] = React.useState<any>("");
  const [userData, setUserData] = React.useState<any>([]);
  const [userid, setuserId] = React.useState<any>(0);
  const [index, setIndex] = React.useState<any>(0);
  const [theme, setTheme] = React.useState<any>("dark");
  const [dark, setDark] = React.useState<any>(false);
  const [isOpen, setisOpen] = React.useState<any>(false);
  const [remove, setRemove] = React.useState<any>(false);
  const [isVisible, setIsVisible] = React.useState<any>(false);
  const [activeTab, setActiveTab] = React.useState<any>('Home');
  
 



  const readTheme = () => {
    let themme = "";
    themme = reactLocalStorage.get("theme");

    if (themme) {
      if(themme == "light"){
        setTheme("light");
        setDark(false)
      document.body.style.backgroundColor = '#FFF7ED';
      document.body.style.color = 'black';
        reactLocalStorage.set('theme','light')
      

      }else{
        
        document.body.style.backgroundColor = '#171717';
      document.body.style.color = 'white';
        setTheme('dark');
        setDark(true)
    

      }
      
    } else {
      setTheme("light");
      reactLocalStorage.set('theme','light')
      setDark(false)
      document.body.style.backgroundColor = '#FFF7ED';
      document.body.style.color = 'black';
    }

    return themme;
  };

  const readCookie = () => {
    const token = Cookies.get("token");
  
    if (token) {
      setAuth(token);   
      fetch("/api/userData")
      .then((res) => res.json())
      .then((data) => {
        if(data.length == 0)return;
        setUserData(data)
      }).catch((err) => console.error("Error fetching games:", err))

    } else {
      setAuth("");
    }
  };

 
const handleuserData =()=>{

  setIsVisible(true);

  
}

  
  React.useEffect(() => {
    
    readTheme();
    
    readCookie();
   handleuserData();


    

   
  }, []);

 

  return (
    <Router>
   
        <AuthApi.Provider
          value={{
            auth,
            setAuth,
            userid,
            setuserId,
            theme,
            setTheme,
            setUserData,
            userData,
            setIndex,
            index,
            setRemove,
            remove,
            isOpen,
            setisOpen,
            isVisible,
            activeTab,
            setActiveTab,
            setIsVisible,
            setDark,
            dark
            
          }}
        >
          

          <React.Suspense fallback={<div></div>}>
            <NavBar />
            {<Routess index={index} userData={userData.length > 0 ? userData : []} />}
            <Footer />

          </React.Suspense>
        </AuthApi.Provider>
    
    </Router>
  );
}

const Routess = ({} : {userData:any[]; index:number;}) => {
 // @ts-ignore
  const Auth = React.useContext(AuthApi);
  //Auth.setDark(false)
  
  return (
    <Routes>
       
       
  <Route
        path={"/sora2/remix/:video_id"}
        element={
          
           <GenerateRemixPage  />
          
        }
      />
     
        <Route
        path={"/sora2/try"}
        element={
          
           <GeneratePage  />
          
        }
      />

        
<Route
        path={"/doc/api"}
        element={
          
           <APIPage  />
          
        }
      />

      

 <Route
        path={"/sora2/videos"}
        element={
         
           <ListPage  />
          
        }
      />
      <Route
        path={"/sora2/watermark"}
        element={
         
           <WatermarkPage  />
          
        }
      />
        

      <Route
        path={"/"}
        element={
         
           <LandingPage />
      
          
        }
      />
       

      
      
      <Route
        path={"*"}
        element={
         
          <div className="min-h-screen pt-40 bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center px-6 py-12">
            <h1 className="text-8xl font-extrabold text-center mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            404
            </h1>
            <p className="text-gray-400 text-lg text-center">
            The link you are trying to access is broken or no longer available. Please check the URL or return to the homepage.
           </p>
           <a
            href="/"
            className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
             >
            Go to Homepage
            </a>
          </div>
         
        }
      />
      
    </Routes>
   

  );
};




export default App;
