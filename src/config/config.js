import { config as dotenvConfig } from "dotenv"

dotenvConfig()


const _config = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    JWT_SECRET: process.env.JWT_SECRET
}


export default Object.freeze(_config)