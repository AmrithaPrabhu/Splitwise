import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css'

const GroupForm = () => {
  const { groupId } = useParams();
  const location = useLocation();
  const { groupName } = location.state || {}
  const [settlements, setSettlements] = useState([])
  const [groupMembers, setGroupMembers] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [selectedFromMember, setSelectedFromMember] = useState('')
  const [splitEqually, setSplitEqually] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [amounts, setAmounts] = useState({})
  const [amount, setAmount] = useState(0)
  let [desc, setDesc] = useState('')
  const [error, setError] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [addMemberForm, setAddMemberForm] = useState(false)
  const [newMember, setNewMember] = useState('')
  const [editExpenseForm, setEditExpenseForm] = useState('')
  const fetchSettlements = async () => {
    try{
      const response = await fetch(`/api/groups/${groupId}/settlements`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log('Fetched settlements:', data);
        if (Array.isArray(data)) {
          setSettlements(data)
        } else {
          console.error('Fetched data is not an array:', data)  
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        setSettlements([])
      }

    }catch(err){
      console.log(err)
    }
  }
  const toggleExpenseForm = () => {
    setShowExpenseForm(!showExpenseForm);
  }
  const toggleMemberForm = () => {
    setAddMemberForm(!addMemberForm)
  }
  const toggleEditExpenseForm = () => {
    setEditExpenseForm(!editExpenseForm)
  }
  const fetchGroupMembersAndTransations = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setGroupMembers(data[0])
        setTransactions(data[1])
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        setGroupMembers([])
        setTransactions([])
      }
    } catch (err) {
      console.log(err);
    }
  };

  const totalAmount = (tran) => {
    let amt = 0
    for(const element of tran){
      amt+=element[2]
    }
    return amt
  }

  const paidBy = (tran) => {
    let from = []
    for(const element of tran){
      if(!tran.includes(element[0])){
        from.push(element[0])
      }
    }
    let amts = {}
    for(const f of from){
      let amt = 0
      for(const ele of tran){
        if(ele[0] === f){
          amt+=ele[2]
        }
      }
      amts[f] = amt
    }
    return amts
  }
  const handleSplitChange = (e) => {
    const selectedValue = e.target.value;
    if(selectedValue === '1'){
      setAmounts({})
    }
    setSplitEqually(selectedValue === '1');
  };

  const handleSelectMember = (memberName) => {
    if (selectedMembers.includes(memberName)) {
      setSelectedMembers(selectedMembers.filter((name) => name !== memberName));
    } else {
      setSelectedMembers([...selectedMembers, memberName]);
    }
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === groupMembers.length) {
      setSelectedMembers([]);
      setAmounts({});
    } else {
      setSelectedMembers([...groupMembers]);
      const amountsObject = groupMembers.reduce((acc, member) => {
        acc[member] = '';
        return acc;
      }, {});
      setAmounts(amountsObject);
    }
  };

  const handleAmountChange = (memberName, amount) => {
    setAmounts({
      ...amounts,
      [memberName]: amount,
    })
  }

  const handleEdit = (key) => {
    setEditExpenseForm(key);
  }

  useEffect(() => {
    fetchGroupMembersAndTransations()
    fetchSettlements()
  }, [])

  const handleDelete = async(key) =>{
    console.log(key)
    try{
    const response = await fetch(`/api/groups/${groupId}/deleteTransaction`,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    })
    const data = await response.json()
    if(data.success === false){
      setError(data.message)
      console.log("Something went wrong ", data)
    }
    window.location.reload()
  }catch(Err){
    setError(data)
    console.log(Err)
  }
    
  }
  const handleSaveExpense = async(e) => {
      e.preventDefault()
      if(desc==='' || amount===0 || !selectedFromMember || selectedMembers===(undefined||null)){
        alert("All fields are mandatory")
      }
      try{
      let formData = []
      if(!splitEqually){
        let confirmAmount = 0
        if(Object.keys(amounts).length!==0){
            for(const key of Object.keys(amounts)){
                confirmAmount += parseFloat(amounts[key])
                let amt = parseFloat(amounts[key])
                formData.push([selectedFromMember, key, amt])
            }
        }
        if(confirmAmount > amount){
          setAmounts({})
          setSelectedMembers([])
          alert("The sum total amounts doesnt add up to the amount you mentioned")
        }
      }else{
        let splitAmount = parseFloat(amount)/selectedMembers.length
        splitAmount = parseFloat(splitAmount.toFixed(2));
        for(const member of selectedMembers){
          formData.push([selectedFromMember, member, splitAmount])
        }
      }
      const response = await fetch(`/api/groups/${groupId}/addExpense`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({formData,desc})
        }
      )
      const data = await response.json()
      if(data.success === false){
        setError(data.message)
        console.log("Something went wrong ", data)
      }
      toggleExpenseForm()
      window.location.reload()
    }catch(err){
      setError(error)
    }
  }

  const handleAddMember = async(e)=>{
    e.preventDefault()
    if(newMember!==''){
      try{
        const response = await fetch(`/api/groups/${groupId}/addNewMember`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({newMember})
        })
        const data = await response.json()
        if(data.success===false){
          setError(data.message)
          return
        }
        toggleMemberForm()
        window.location.reload()
      }
    catch(err){
      setError(err)
      console.log(err)
    }
   }
  }

  const handleEditExpense = async (e) => {
    e.preventDefault()
    console.log(editExpenseForm, desc, amount, selectedFromMember, selectedMembers)
      if(desc===''){
        desc = editExpenseForm
      }
      if(desc==='' || amount===0 || !selectedFromMember || selectedMembers===(undefined||null)){
        alert("All fields are mandatory")
      }
      try{
      let formData = []
      if(!splitEqually){
        let confirmAmount = 0
        if(Object.keys(amounts).length!==0){
            for(const key of Object.keys(amounts)){
                confirmAmount += parseFloat(amounts[key])
                let amt = parseFloat(amounts[key])
                formData.push([selectedFromMember, key, amt])
            }
        }
        if(confirmAmount > amount){
          setAmounts({})
          setSelectedMembers([])
          alert("The sum total amounts doesnt add up to the amount you mentioned")
        }
      }else{
        let splitAmount = parseFloat(amount)/selectedMembers.length
        splitAmount = parseFloat(splitAmount.toFixed(2));
        for(const member of selectedMembers){
          formData.push([selectedFromMember, member, splitAmount])
        }
      }
      const response = await fetch(`/api/groups/${groupId}/updateExpense`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({formData,desc,editExpenseForm})
        }
      )
      const data = await response.json()
      if(data.success===false){
        setError(data.message)
        return
      }
      setEditExpenseForm('')
      window.location.reload()
    }catch(err){
      setError(err)
      console.log(err)
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>{groupName && groupName}</h1>
      <div>
        {groupMembers===undefined || null ? (<p>No members added yet</p>): (
          <div>
          <p className='text-xl font-semibold text-center mb-2'>Group Members :</p>
          <ul className='flex gap-2 mb-5 justify-center'>
            {
              groupMembers.map((member) =>(
                <li className=''>{member}</li>
              ))
            }
          </ul>
          </div>
        )}
      </div>
      <form className='flex flex-col gap-4'>
        <button
          type='button'
          className='bg-slate-700 text-white p-3 cursor-pointer rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          onClick={toggleExpenseForm}
        >
          Add Expense
        </button>
        <button
          type='button'
          className='bg-slate-700 text-white p-3 cursor-pointer rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          onClick={toggleMemberForm}
        >
          Add Member
        </button>
      </form >
      {error? (<p className='text-red-700'>{error}</p> ) : ("")}
      {addMemberForm && (
        <div className='bg-white p-4 mt-4 rounded-lg shadow'>
          <div className='flex justify-between'>
          <h2 className='text-2xl font-semibold mb-3 mx-auto text-center'>Add Member</h2>
          <i className="fas fa-times cursor-pointer" style={{ color: "black", marginTop: "7px" }} onClick={toggleMemberForm}></i>
          </div>
          <form onSubmit={handleAddMember} > 
            <input type="text" placeholder="Member Name" className='bg-slate-100 rounded-lg p-3 mx-7' onChange={(e) => setNewMember(e.target.value)} />
            <button
              type='submit'
              className='bg-slate-700 cursor-pointer text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
            >
              Save Member
            </button>
          </form>
        </div>
      )}
      {showExpenseForm && (
        <div className='bg-white p-4 mt-4 rounded-lg shadow'>
          <div className='flex justify-between'>
          <h2 className='text-2xl font-semibold mb-3 mx-auto'>Add Expense</h2>
          <i className="fas fa-times cursor-pointer" style={{ color: "black", marginTop: "7px" }} onClick={toggleExpenseForm}></i>
          </div>
          <form onSubmit={handleSaveExpense} className='flex flex-col gap-4'>
            <input type="text" placeholder="Enter description" className='bg-slate-100 rounded-lg p-3' onChange={(e) => setDesc(e.target.value)} />
            <select
              className='bg-slate-100 rounded-lg p-3'
              value={selectedFromMember}
              onChange={(e) => setSelectedFromMember(e.target.value)}
            >
              <option value="" disabled>Select From</option>
              {groupMembers.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            <select className='bg-slate-100 rounded-lg p-3' onChange={handleSplitChange}>
              <option value="" disabled selected hidden>Split</option>
              <option key="1" value="1">Split Equally Among</option>
              <option key="2" value="2">Split Unequally</option>
            </select>
            <input type="number" placeholder="Amount" className='bg-slate-100 rounded-lg p-3' onChange={(e) => setAmount(e.target.value)}/>
            {splitEqually && (
              <div className='bg-slate-100 rounded-lg p-3'>
              <div className='flex items-center mb-2'>
                <input
                  type="checkbox"
                  checked={selectedMembers.length === groupMembers.length}
                  onChange={handleSelectAll}
                />
                <label className='ml-2'>Select All</label>
              </div>
              {groupMembers.map((member) => (
                <div key={member} className='flex items-center'>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member)}
                    onChange={() => handleSelectMember(member)}
                  />
                  <label className='ml-2'>{member}</label>
                </div>
              ))}
            </div>
            )}
            {!splitEqually && (
              <div className='bg-slate-100 rounded-lg p-3'>
              {groupMembers
                .map((member) => (
                  <div key={member} className='flex items-center'>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member)}
                      onChange={() => handleSelectMember(member)}
                    />
                    <label className='ml-2'>{member}</label>
                    {selectedMembers.includes(member) && (
                        <input
                          type="number"
                          placeholder="Amount"
                          className='ml-2 bg-slate-100 rounded-lg p-2'
                          value={amounts[member] || ''}
                          onChange={(e) => handleAmountChange(member, e.target.value)}
                        />
                      )}
                  </div>
                ))}
            </div>
            )}
            <button
              type='submit'
              className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
            >
              Save Expense
            </button>
          </form>
        </div>
      )}

    <ul className='flex flex-col p-7'>
        {settlements === undefined||null ? (
           ""
            ) : (
            <div>
              <h3 className='mb-4 font-semibold'>Settlements</h3>
              {
            settlements.map((settlement) => (
                <li className='bg-white p-4 mb-2 rounded-lg shadow'>
                {`${settlement[0]} needs to pay ${settlement[1]} - ${settlement[2]}`}
                </li>
            ))}
            </div>
            )}
    </ul>

    <ul className='flex flex-col p-7'>
        {!transactions ? (
            <li>No transactions yet</li>
        ) : (
          <div>
            <h3 className='mb-4 font-semibold'>Transactions so far</h3>
            <ul>
            {Object.entries(transactions).map(([key, tran]) => (
               <div  key={key}>
                <div className='flex justify-between items-center'>
                <li key={key} className='bg-white p-4 mb-2 rounded-lg shadow justify-between'>
                    <h6>{key}</h6>
                    <p>Amount Details: {totalAmount(tran)}</p>
                    <p>
                        {Object.entries(paidBy(tran)).map(([payer, amount]) => (
                            <p>
                                <strong>{`Paid by ${payer}`}:</strong> {amount}
                            </p>
                        ))}
                    </p>
                </li>
                <li className='flex'>
                <i className="fas fa-edit cursor-pointer mr-5 mt-2" style={{ color: "blue"}} onClick={() => handleEdit(key)}></i>
                <i class="fas fa-trash-alt cursor-pointer" style={{ color: "red", marginTop: "7px" }} onClick={() => handleDelete(key)}></i>
                </li>
                </div>
                {editExpenseForm === key && (
                  <div className='bg-white p-4 mt-4 rounded-lg shadow'>
                  <div className='flex justify-between'>
                  <h2 className='text-2xl font-semibold mb-3 mx-auto'>Edit Expense</h2>
                  <i className="fas fa-times cursor-pointer" style={{ color: "black", marginTop: "7px" }} onClick={toggleEditExpenseForm}></i>
                  </div>
                  <form onSubmit={handleEditExpense} className='flex flex-col gap-4'>
                    <input type="text" placeholder="Enter description" className='bg-slate-100 rounded-lg p-3' defaultValue={key} onChange={(e) => setDesc(e.target.value)} />
                    <select
                      className='bg-slate-100 rounded-lg p-3'
                      value={selectedFromMember}
                      onChange={(e) => setSelectedFromMember(e.target.value)}
                    >
                      <option value="" disabled>Select From</option>
                      {groupMembers.map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                    <select className='bg-slate-100 rounded-lg p-3' onChange={handleSplitChange}>
                      <option value="" disabled selected hidden>Split</option>
                      <option key="1" value="1">Split Equally Among</option>
                      <option key="2" value="2">Split Unequally</option>
                    </select>
                    <input type="number" placeholder="Amount" className='bg-slate-100 rounded-lg p-3' onChange={(e) => setAmount(e.target.value)}/>
                    {splitEqually && (
                      <div className='bg-slate-100 rounded-lg p-3'>
                      <div className='flex items-center mb-2'>
                        <input
                          type="checkbox"
                          checked={selectedMembers.length === groupMembers.length}
                          onChange={handleSelectAll}
                        />
                        <label className='ml-2'>Select All</label>
                      </div>
                      {groupMembers.map((member) => (
                        <div key={member} className='flex items-center'>
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member)}
                            onChange={() => handleSelectMember(member)}
                          />
                          <label className='ml-2'>{member}</label>
                        </div>
                      ))}
                    </div>
                    )}
                    {!splitEqually && (
                      <div className='bg-slate-100 rounded-lg p-3'>
                      {groupMembers
                        .map((member) => (
                          <div key={member} className='flex items-center'>
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member)}
                              onChange={() => handleSelectMember(member)}
                            />
                            <label className='ml-2'>{member}</label>
                            {selectedMembers.includes(member) && (
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  className='ml-2 bg-slate-100 rounded-lg p-2'
                                  value={amounts[member] || ''}
                                  onChange={(e) => handleAmountChange(member, e.target.value)}
                                />
                              )}
                          </div>
                        ))}
                    </div>
                    )}
                    <button
                      type='submit'
                      className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                    >
                      Save Edited Expense
                    </button>
                  </form>
                </div>
                )}
                </div>   
            ))}

            </ul>
            </div>
        )}
    </ul>

    </div>
  );
};

export default GroupForm;
