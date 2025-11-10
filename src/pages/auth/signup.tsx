import React from "react";
//import { reactLocalStorage } from "reactjs-localstorage";
//import Cookies from "js-cookie";
import AuthApi from "../../components/AuthApi";
import { useNavigate,Link } from "react-router-dom";

interface SignUpData {
  name: string;
  username: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
}

const SignUp = () => {
  const [formData, setFormData] = React.useState<SignUpData>({
    name: "",
    username: "",
    avatar: "",
    email: "",
    password: "",
    role: "user",
  });
  const [fileData,setFile] = React.useState(null)
  const [avatar,setAvatar] = React.useState(null)
  const [errorStatus,setErrorStatus] = React.useState("")
  const [succesStatus,setSuccesStatus] = React.useState("")
   const Auth = React.useContext(AuthApi);
    const Navigate = useNavigate();
    

  const handleChange = (fieldName: keyof SignUpData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]:  value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signing up with:", formData);
    // Add signup API logic here
    const data = new FormData();
    if(formData.name == "")return alert('Please enter your name')
    if(formData.email == "")return alert('Please enter your email')
    if(formData.username == "")return alert('Please enter your username')
      if(formData.password == "")return alert('Please enter your password')
    setErrorStatus('')
    setSuccesStatus('')
    

    data.append("name",formData.name)
    data.append("email",formData.email)
    data.append("username",formData.username)
    data.append("role",formData.role)
    data.append("password",formData.password)
    if(fileData){
      data.append("file-blob",fileData)
      // @ts-ignore
      data.append("file-name",''+fileData?.name)
    }
    
    
    fetch('/api/signup',{
      method:'POST',
      body:data
    }).then(res=>res.json())
    .then(response=>{
      if(response.Success == "User Created"){
        setSuccesStatus(response.Success)
        fetch('/api/signin',{
          method:'POST',
          body:JSON.stringify({"email":formData.email,"password":formData.password})
        }).then(res=>res.json())
        .then(responses=>{
          if(responses?.resp == "ok"){
            //Cookies.set('token',responses.Token,{m})
            // @ts-ignore
            Auth.setAuth(responses.Token)
            // @ts-ignore
            Auth.setUserData([...responses.userAuth])
            localStorage.setItem('userData',JSON.stringify(responses.userAuth))
            Navigate('/');
          }else{

          setErrorStatus(response.Error)

          }
        })

      }else{
        setErrorStatus(response.Success)
      }
    })
    
    
  
  };



  return (
    <div className="flex items-center text-white justify-center py-30 pb-20 bg-black">
        <div className='hero-background-red'>
          <div className='cyber-grid-red ' />
        </div>
      <form
        onSubmit={handleSubmit}
        className="bg-[#131313] shadow-lg rounded-2xl p-8 md:w-3xl w-full relative z-2"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Join the Operation
        </h2>


        <div className={`w-full flex sm:flex-row flex-col items-center sm:gap-5 gap-2 mt-10 mb-5`}>
        <div onClick={()=>{
          handleChange("role", "user")

        }} className={`p-4 w-full text-white flex flex-col cursor-pointer items-center border ${formData.role == "user"?' border-green-500/70 bg-green-500/20':' border-gray-500 hover:border-green-500/70 bg-[#282d2f] hover:bg-green-500/20'} rounded-lg `}>
        <b className="text-[20px] text-center">User</b>
        <p className="text-center text-gray-200 text-sm">Submit suspicious gameplay footage with detailed timestamps and descriptions</p>
        </div>

        <div onClick={()=>{

          handleChange("role", "developer")

        }} className={`p-4 w-full text-white flex flex-col cursor-pointer items-center border ${formData.role == "developer"?' border-green-500/70 bg-green-500/20':' border-gray-500 hover:border-green-500/70 bg-[#282d2f] hover:bg-green-500/20'} rounded-lg `}>
        <b className="text-[20px] text-center">Developers/Studios</b>
        <p className="text-center text-gray-200 text-sm">Webhooks, partner API to integrate evidence into your anti-cheat workflows.</p>
        </div>
        
        </div>

         <label className="block w-full text-gray-100 mb-2" htmlFor="avatar"><p className="block w-full text-gray-400 mb-2 " >Choose Avatar</p>
         <div className="mb-4 flex  gap-2">
          
          {avatar?<img src={avatar} className={`w-15 h-15 object-cover bg-gray-200 rounded-full flex-none`} />:<div className={`bg-gray-200 flex-none w-15 h-15 rounded-full`}></div>}
          <input
            id="avatar"
            type='file'
            accept="image/*"
            onChange={(e) => {
              // @ts-ignore
              if (e.target.files[0].name.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
              // @ts-ignore
              setFile(e.target.files[0]);
              // @ts-ignore
              const file = e.target.files[0];
              if (file) {
              const objectUrl = URL.createObjectURL(file);
              // @ts-ignore
              setAvatar(objectUrl)
              }
            }else{
            alert('Please select image file!')
            }

            }}
            placeholder="Profile Image URL"
            className="w-full border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        </label>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Full Name"
            className="w-full border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Username"
            className="w-full border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

       

        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Email Address"
            className="w-full border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="password_hash">
            Password
          </label>
          <input
            id="password_hash"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

           
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Up
        </button>

             {succesStatus != ""?<div className="mb-6 text-green-500 w-full justify-center flex flex-col items-center"><span>{succesStatus}</span></div>:null} 

             {errorStatus != ""?<div className="mb-6 text-red-500 w-full justify-center flex flex-col items-center"><span>{errorStatus}</span></div>:null} 



        <p className="text-center text-gray-200 text-sm mt-4">
          Already have an account? <Link to="/signin/" className="text-cyan-400 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
