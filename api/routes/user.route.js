import express from "express"
import { getContacts, updateUser , deleteUser, signout} from "../controller/user.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

router.get("/", getContacts)
router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)
router.get('/signout', signout)
export default router