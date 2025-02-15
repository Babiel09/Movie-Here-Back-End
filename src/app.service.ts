import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService{
    public async hashRandomSalt(valueToHash:string){
        const saltArray:number[] = [12,14,16,18,20,22,24,26,28,30,32,34,36,38,40];
        let salt:number = Math.floor(Math.random() * saltArray.length);
        const newValue = await bcrypt.hash(valueToHash,salt)
        return newValue;
   };
};