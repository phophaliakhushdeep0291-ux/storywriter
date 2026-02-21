import pg from "pg"
import logger from "../utils/logger.js"
const{Pool}=pg

const pool=new Pool({
    host:process.env.PG_HOST,
    port:process.env.PG_PORT,
    database:process.env.PG_DB,
    user:process.env.PG_USER,
    password:process.env.PG_PASSWORD,
})
const connectPostgres=async()=>{
    try {
        await pool.query("SELECT 1")
        logger.info("PostgreSQL connected successfully")
    } catch (error) {
        logger.error(`Postgres connection failed:${error.message}`)
        process.exit(1)
    }
}

export{pool}
export default connectPostgres