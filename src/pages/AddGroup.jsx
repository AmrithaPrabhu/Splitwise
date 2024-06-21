import React, { useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate} from 'react-router-dom'
function AddGroup() {
  const [numMembers, setNumMembers] = useState(0);
  const [members, setMembers] = useState([]);
  const {currentUser, loading, error} = useSelector((state)=>state.user)
  const [name, setName] = useState("")
  const navigate = useNavigate()

  const handleNameChange = (e) => {
    setName(e.target.value)
  }
  const handleNumMembersChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumMembers(count);
    setMembers(new Array(count).fill(''));
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e) => {

    try{
      e.preventDefault()
    const user_id = currentUser._id
    const response = await fetch(`/api/groups/${currentUser._id}/createGroup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_id, name, members})
    })

    const data = await response.json()
    console.log(data)
    navigate("/groups")
    }catch(err){
      console.log(err)
    }
    
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create New Group</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-14'>
        <input onChange={handleNameChange} type="text" id="name" name="name" placeholder="Group Name" className='bg-slate-100 rounded-lg p-3'/>
        <input 
          type="number" 
          id="numMembers" 
          name="numMembers" 
          placeholder="Number of Members" 
          className='bg-slate-100 rounded-lg p-3'
          value={numMembers}
          onChange={handleNumMembersChange}
        />
        {members.map((member, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Member ${index + 1} Name`}
            className='bg-slate-100 rounded-lg p-3'
            value={member}
            onChange={(e) => handleMemberChange(index, e.target.value)}
          />
        ))}
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>Submit</button>
      </form>
    </div>
  );
}

export default AddGroup;
