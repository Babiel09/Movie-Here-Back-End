import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy,VerifyCallback } from "passport-google-oauth20";
import { UserService } from "src/user/user.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google"){
    private readonly logger = new Logger(GoogleStrategy.name);
    constructor(private readonly jwtService:JwtService,private readonly userService:UserService){
        super({
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:process.env.GOOGLE_CALLBACK_URL,
            scope:["email","profile"],
        });
    };


    public async validate(accessToken?:string, refreshToken?:string, profile?:any, done?:VerifyCallback):Promise<any>{
        const {name,emails,photos} = profile;
        
        const userWithGoogle = {
            name:name.givenName,
            email: emails[0].value,
            photo:photos[0].value,
            token:accessToken
        };

        const photoArrayBuffer = new ArrayBuffer(userWithGoogle.photo);

        const bytes = new Uint8Array(photoArrayBuffer);

        this.logger.debug(userWithGoogle);

        userWithGoogle.photo = bytes;

        const newUserWithGoogle = await this.userService.InsertuserWIthGoogle(userWithGoogle)

        const payload = {id:newUserWithGoogle.id,name:newUserWithGoogle.name,email:newUserWithGoogle.email,password:newUserWithGoogle.password,description:newUserWithGoogle.description}

        const token = await this.jwtService.signAsync(payload);

        this.logger.debug(token);

        return token;
        
    };

};