import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const { register, formState: { errors }, handleSubmit } = useForm();
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async(data) => {
    try {
      setLoading(true);

      // Firedase Login
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      setLoading(false); 
    }
    catch (error) {
      // 회원가입 에러 발생 시 에러 문구 출력
      setErrorFromSubmit(error.message)

      // 에러 문구 5초 노출 후 사라짐
      setTimeout(() => {
        setErrorFromSubmit("")
      }, 5000);
  }
  }



  return (
    <div className="auth-wrapper">
      <div style={{ textAlign: 'center' }}>
        <h3>Login</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
        />
        {errors.email && <p>This email field is required</p>}

        <label>Password</label>
        <input
          name="password"
          type="password"
          {...register("password", { required: true, minLength: 6 })}
        />
        {errors.password && errors.password.type === "required" && <p>This password field is required</p>}
        {errors.password && errors.password.type === "minLength" && <p>Password must have at least 6 characters</p>}

        {errorFromSubmit && <p>{errorFromSubmit}</p>} 

        <input type="submit" value={'login'} disabled={loading}/>

        <Link style={{ color: 'gray', textDecoration: 'none' }} to="login">아직 아이디가 없다면... </Link>
      </form>
    </div>
  )
}

export default LoginPage