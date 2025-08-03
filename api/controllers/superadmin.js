import Labs from "../models/labs.js";
import Users from "../models/users.js";
import Reservations from "../models/reservations.js";
import mongoose from "mongoose";
import multer from "multer";
import { Router } from "express";
import { errorDatabaseLogger } from "../middlewares/logger.js";

const router = Router();


router.put("/promote", async(req, res) => {
    try{
        const id_number = req.body.idNumber;
        
        const update = await Users.findOneAndUpdate( {id_number: id_number}, { role: "Admin"} );

        res.status(200).json({message: "Successfully promoted user to Lab Technician"})
    } catch( err ){
        console.log("Error promoting user", err);
        errorDatabaseLogger("User Promotion Error", err);
        res.status(500).json({message: "Error promoting user"});
    }
})

export default router;