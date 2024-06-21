import express from 'express'
import {getGroups, createGroup, getGroupMembers, addExpense, getSettlements, deleteTransaction, addNewMember, deleteGroup, editExpense} from "../controller/group.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

router.get("/:id", verifyToken, getGroups)
router.get("/:id/members", verifyToken, getGroupMembers)
router.get("/:id/settlements", verifyToken, getSettlements)
router.post("/:id/createGroup", verifyToken, createGroup)
router.post("/:id/addExpense", verifyToken, addExpense)
router.delete("/:id/deleteTransaction", deleteTransaction)
router.post("/:id/addNewMember", verifyToken, addNewMember)
router.delete("/:id/deleteGroup", verifyToken, deleteGroup)
router.post("/:id/updateExpense", verifyToken, editExpense)
export default router

