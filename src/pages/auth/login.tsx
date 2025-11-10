import React from "react";
import AuthApi from "../../components/AuthApi";
import { Link,useNavigate } from "react-router-dom";

interface SignInData {
  email: string;
  password: string;
}

const SignIn = () => {
  const [formData, setFormData] = React.useState<SignInData>({
    email: "",
    password: "",
  });
  
  // @ts-ignore
  const [errorStatus,setErrorStatus] = React.useState("")
  // @ts-ignore
    const [succesStatus,setSuccessStatus] = React.useState("")
     const Auth = React.useContext(AuthApi);
     const Navigate = useNavigate();

  const handleChange = (fieldName: keyof SignInData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(formData.email == "")return alert('Please enter your email')
    if(formData.password == "")return alert('Please enter your password')
    
    fetch('/api/signin',{
          method:'POST',
          body:JSON.stringify({"email":formData.email,"password":formData.password})
        }).then(res=>res.json())
        .then(responses=>{
          if(responses?.resp == "ok"){
           
            // @ts-ignore
            Auth.setAuth(responses.Token)
            // @ts-ignore
            Auth.setUserData([...responses.userAuth])
            setErrorStatus("")
            setSuccessStatus('User Signed in')
            localStorage.setItem('userData',JSON.stringify(responses.userAuth))
            Navigate('/')
          }else{
            setErrorStatus(responses.Error)


          }
        })
   

    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <img src={'https://cheaterpurgatory.developerscope.com/upload/bacground1.png'} className={`fixed opacity-8 w-full h-full left-0 object-cover top-0`} />

      <form
        onSubmit={handleSubmit}
        className="bg-[#131313] text-white shadow-lg rounded-2xl p-8 md:w-3xl w-full relative z-2"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-100">
          Sign In
        </h2>

        <div className="mb-4">
          <label className="block text-gray-200 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign In
        </button>
        
        <p className="text-center text-gray-300 text-sm mt-4">
          Don't have an account? <Link to="/signup" className="text-cyan-400 hover:text-cyan-500 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
