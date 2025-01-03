import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const response = context.switchToHttp().getRequest();
        const api_key = response.headers;
        if(api_key && api_key === String(process.env.API_KEY)){
            return true;
        };
            return false;
    };
};