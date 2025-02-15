import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService{
    public async hashRandomSalt(valueToHash:string){
        const saltArray:number[] = [12,14,16,18,20,22,24,26,28,30,32,34,36,38,40];
        for(let i = 0; i < saltArray.length; i++){
          await bcrypt.hash(valueToHash,saltArray[i])
          };
        };
};