'use client'
import React, { useEffect } from 'react'

const Users = () => {


  useEffect(()=>{
    fetchusers()
  },[])
  const fetchusers = async () =>{
    try {
      const response = await fetch('/api/admin/users?role=USER')
      const data = response.json()
      console.log(data)
      
    } catch (error) {
      
    }
  }
  return (
    <div>Users</div>
  )
}

export default Users