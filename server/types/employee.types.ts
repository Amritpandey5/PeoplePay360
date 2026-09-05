import mongoose from "mongoose";
import { EmploymentStatus, UserRole,  } from "./enums.ts";


type Allocation = {
    hospital? : {
        amount: number
    }
    cab? :{
        amount: number
    }
    house: {
        amount: number
    }

}

export interface Employee {
    name:string;
    email:string;
    password:string;
    dob:Date;
    doj:Date;
    payout:number;
    allocation?:Allocation;
    location?:{
        city:string;
        state:string;
        country:string;
    }
    hr?:mongoose.Types.ObjectId;
    company:mongoose.Types.ObjectId;
    role:UserRole.EMPLOYEE
    status:EmploymentStatus;

}

