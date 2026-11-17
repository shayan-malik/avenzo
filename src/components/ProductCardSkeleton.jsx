export default function ProductCardSkeleton() {
    return (
        <div className="glass overflow-hidden rounded-2xl">
            <div className="skeleton h-56" />

            <div className="space-y-3 p-5">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />

                <div className="flex items-end justify-between pt-3">
                    <div className="skeleton h-6 w-24 rounded" />
                    <div className="skeleton h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    );
}