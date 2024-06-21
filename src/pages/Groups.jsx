import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link} from 'react-router-dom'
function Groups() {
  const {currentUser} = useSelector((state)=>state.user)
  const [group, setGroup] = useState([])
  const navigate = useNavigate()
  useEffect(()=>{
    fetchGroups()
  },[])

  const fetchGroups = async () => {
    try{
        console.log("current user "+ currentUser._id)
        const response = await fetch(`/api/groups/${currentUser._id}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const text = await response.text()
          try {
            const data = JSON.parse(text)
            console.log('Fetched groups data:', data)
            if (Array.isArray(data)) {
              setGroup(data);
            } else {
              console.error('Fetched data is not an array:', data)
              setGroup([])
            }
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            setGroup([])
          }
    }catch(err){
        console.log(err)
    }
  }
  const handleCreateGroupClick = ()=>{
    navigate("/addGroup")
  }
  const handleDeleteGroup = async (key) => {
    try{
      const response = await fetch(`/api/groups/${key}/deleteGroup`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      })
      const data = await response.json()
    if(data.success === false){
      console.log("Something went wrong ", data)
    }
    window.location.reload()
    }catch(err){
      console.log(err)
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Your Groups</h1>
        <button  type='button' className='bg-slate-700 text-white p-3 w-64 ml-20 cursor-pointer  rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={handleCreateGroupClick}>Create New Group</button>
        <ul className='flex flex-col p-7'>
        {group === (undefined || null) ? (
            <li>No groups available</li>
            ) : (
            group.map((group) => (
              <div className='flex justify-between bg-white p-4 mb-2 rounded-lg shadow'>
                  <Link  to={ `/group/${group._id}`} 
              state= {  {groupName: group.name} }>
                    <li key={group._id} name={group.name} className=''>
                    {group.name}
                    </li>
                    </Link>
                    <i class="fas fa-trash-alt cursor-pointer" style={{ color: "red", marginTop: "7px" }} onClick={() => handleDeleteGroup(group._id)}></i>
                </div>            
            ))
            )}
        </ul>
    </div>
  )
}

export default Groups