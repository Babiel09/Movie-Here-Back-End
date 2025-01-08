import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class UserGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      const security_acess = request.headers["security_acess"]
      if (security_acess && security_acess === process.env.SECURITY_ACESS){
        return true;
      };
      return false;
    };
};