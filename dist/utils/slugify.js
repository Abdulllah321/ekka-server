"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueSlug = generateUniqueSlug;
const cuid_1 = __importDefault(require("cuid"));
const app_1 = require("../app");
async function generateUniqueSlug(name, model) {
    let slug = name.toLowerCase().replace(/\s+/g, "-");
    let uniqueSlug = slug;
    let count = 1;
    while (await app_1.prisma[model].findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${(0, cuid_1.default)()}`;
        count++;
    }
    return uniqueSlug;
}
