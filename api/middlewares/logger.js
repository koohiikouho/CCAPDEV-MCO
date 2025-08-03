import Logs from '../models/logs.js';
import express from "express";
import mongoose from "mongoose";

export async function errorDatabaseLogger(summary, objectBody){
    try{
        const logError = await Logs.create({
        errorSummary: summary,
        errorBody: objectBody
    });
    } catch (error){
        console.log(error);
    }

}

