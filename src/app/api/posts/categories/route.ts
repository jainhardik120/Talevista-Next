import CustomErrorHandler from "@/utils/ErrorHandler";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
    try {
        const categories = [
            { name: 'Horror', shortName: 'horror' },
            { name: 'Comedy', shortName: 'comedy' },
            { name: 'Romance', shortName: 'romance' },
            { name: 'Fantasy', shortName: 'fantasy' },
            { name: 'Sci-Fi', shortName: 'sciencefiction' },
            { name: 'Mystery', shortName: 'mystery' },
            { name: 'Thriller', shortName: 'thriller' },
            { name: 'Adventure', shortName: 'adventure' },
            { name: 'History', shortName: 'historical' },
            { name: 'Drama', shortName: 'drama' },
            { name: 'Action', shortName: 'action' },
            { name: 'Science', shortName: 'science' },
            { name: 'Biography', shortName: 'biography' },
            { name: 'Inspirational', shortName: 'inspirational' },
            { name: 'Poetry', shortName: 'poetry' }
        ];
        return NextResponse.json(categories);
    } catch (err) {
        return CustomErrorHandler(err);
    }
}