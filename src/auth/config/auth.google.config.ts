import { registerAs } from "@nestjs/config";
import { GOOGLE_OAUTH } from "src/constants/constants";

export default registerAs(GOOGLE_OAUTH,()=>(
    {
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"http://localhost:6785/auth/google/callback"
    }
));