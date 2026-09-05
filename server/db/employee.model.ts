import mongoose from "mongoose";
import type {Employee} from "../types/employee.types.ts";
import { UserRole } from "../types/enums.ts";

const employeeSchema = new mongoose.Schema<Employee>({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    dob:{type:Date, required:true},
    doj:{type:Date, required:true},
    payout:{type:Number, required:true},
    allocation:{
        hospital:{
            amount:{type:Number, required:false}
        },
        cab:{
            amount:{type:Number, required:false}
        },
        house:{
            amount:{type:Number, required:true}
        }
    },
    location:{
        city:{type:String, required:false},
        state:{type:String, required:false},    
    },
    hr:{type:mongoose.Types.ObjectId,ref:'HR'},
    company:{type:mongoose.Types.ObjectId,ref:'Company'},
    role:{},
    

       
})