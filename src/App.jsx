import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import About from "./pages/About"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import AddGroup from "./pages/AddGroup"
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import Groups from './pages/Groups'
import GroupForm from './pages/GroupForm'
export default function App() {
  return <BrowserRouter>
  <Header/>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/sign-in" element={<SignIn/>}/>
    <Route path="/sign-up" element={<SignUp/>}/>

    <Route exact path="/profile" element={<PrivateRoute />}>
          <Route exact path='/profile' element={<Profile />} />
    </Route>
    <Route exact path="/groups" element={<PrivateRoute />}>
    <Route path='/groups' element={<Groups/>}/>
    </Route>
    <Route path="/addGroup" element={<AddGroup/>}/>
    <Route path="/group/:groupId" element={<GroupForm/>} />
  </Routes>
  </BrowserRouter>
}
