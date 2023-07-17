import { NextResponse } from "next/server";
import { HttpError } from "./HttpError";


const CustomErrorHandler = (error: unknown): NextResponse => {
    if (error instanceof HttpError) {
        return NextResponse.json(
            {
                error: error.message
            }, {
            status: error.statusCode
        }
        )
    } else {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 }
        )
    }
}

export default CustomErrorHandler