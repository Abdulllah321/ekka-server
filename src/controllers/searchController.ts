// controllers/productController.ts
import {Request, Response} from 'express';
import {prisma} from '../app';


// Controller to handle product search
export const searchProducts = async (req: Request, res: Response):Promise<void> => {
    try {
        const query = req.query;

        const filters: any = {};

        if (query.search) {
            filters.OR = [
                {name: {contains: String(query.search), mode: 'insensitive'}},
                {productTags: {hasSome: query.search.toString().split(',')}}
            ];
        }
        if (query.slug) filters.slug = String(query.slug);
        if (query.mainCategoryId) filters.mainCategoryId = String(query.mainCategoryId);
        if (query.subCategoryId) filters.subCategoryId = String(query.subCategoryId);
        if (query.minPrice && !isNaN(Number(query.minPrice))) {
            filters.price = {...filters.price, gte: Number(query.minPrice)};
        }
        if (query.maxPrice && !isNaN(Number(query.maxPrice))) {
            filters.price = {...filters.price, lte: Number(query.maxPrice)};
        }
        if (query.colors) filters.colors = {hasSome: query.colors.toString().split(',')};
        if (query.sizes) filters.sizes = {hasSome: query.sizes.toString().split(',')};
        if (query.isNew) filters.isNew = query.isNew === 'true';
        if (query.isOnSale) filters.isOnSale = query.isOnSale === 'true';

        const products = await prisma.product.findMany({
            where: filters, select: {
                name: true,
                thumbnail: true,
                slug:true
            }
        });

        if (!products.length) {
             res.status(404).json({success: false, message: 'No products found matching the search criteria.'});return
        }

        res.status(200).json({success: true, message: 'Products retrieved successfully.', data: products});
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching products.',
            error: errorMessage
        });
    }
};
