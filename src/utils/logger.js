import { createLogger, format, transports } from "winston"

const logger=createLogger({
    level:"info",
    format:format.combine(
        format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),
        format.printf(({timestamp,level,message})=>{
            return `[${timestamp}]${level.toUpperCase()}: ${message}`;
        })
    ),
     transports: [
    // Print to terminal
    new transports.Console(),

    // Save all logs to this file
    new transports.File({ filename: "logs/app.log" }),

    // Save only errors to separate file
    new transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

export default logger