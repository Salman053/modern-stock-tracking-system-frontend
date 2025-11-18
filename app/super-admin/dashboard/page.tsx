"use client"
import { useAuth } from '@/hooks/use-auth'
import React from 'react'

const Dashboard = () => {
  const {user  } = useAuth();
  console.log(user)
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard