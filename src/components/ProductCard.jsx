import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "../utils/formatPrice.js";

export default function ProductCard({ product, index = 0 }) {
    const { id, name, price, stock, image_url, category_name } = product;

    let stockText = "In stock";
    let dotClass = "bg-green-400";

    if (stock === 0) {
        stockText = "Out of stock";
        dotClass = "bg-red-400";
    } else if (stock <= 5) {
        stockText = `Only ${stock} left`;
        dotClass = "bg-amber-400";
    }

    return (
        <Link
            to={`/products/${id}`}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            className="group glass card-glow animate-fade-up flex flex-col overflow-hidden rounded-2xl"
        >
            <div
                className="relative flex h-56 items-center justify-center overflow-hidden"
                style={{
                    background:
                        "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), transparent 65%)"
                }}
            >
                {category_name && (
                    <span className="glass absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold text-accent">
                        {category_name}
                    </span>
                )}

                <span className="glass absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-white/90">
                    <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                    {stockText}
                </span>

                {image_url ? (
                    <img
                        src={image_url}
                        alt={name}
                        loading="lazy"
                        className={`h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110 ${
                            stock === 0 ? "opacity-50 grayscale" : ""
                        }`}
                    />
                ) : (
                    <span className="text-sm text-muted">No image</span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="truncate text-lg font-bold" title={name}>
                    {name}
                </h3>

                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted">Price</p>
                        <p className="text-gradient text-xl font-extrabold">
                            {formatPrice(price)}
                        </p>
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition duration-300 group-hover:border-transparent group-hover:bg-accent group-hover:text-black">
                        <ArrowUpRight size={18} />
                    </span>
                </div>
            </div>
        </Link>
    );
}