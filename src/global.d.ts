import mongoose from "mongoose"

declare global{
    var mongoose : {
        conn : mongoose,
        promise : Promise
    }
}