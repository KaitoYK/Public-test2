"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { de } from "zod/locales";


export default function Signup() {


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
 

    const handleSubmit = async () => {
      if (!email || !password || !confirmPassword || !name) {
        setError("All fields are required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        const response = await axios.post("/api/auth/signup", {
          email,
          password,
          name
        });
        // Handle successful signup (e.g., redirect to login page)
      } catch (error) {
        setError("An error occurred during signup");
      }
    }

    const onSubmit = 

    }



  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          this is the signup page
        </h1>
  
      </div>
    </div>
  );
};
